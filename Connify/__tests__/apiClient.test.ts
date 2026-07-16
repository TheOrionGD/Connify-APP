import http from 'http';
import { apiClient } from '../src/services/api/apiClient';
import { useAuthStore } from '../src/stores/authStore';

// Mock other native dependencies
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  });
});
jest.mock('@react-native-firebase/app', () => ({}), { virtual: true });

describe('Axios Client Interceptors and Configuration Verification', () => {
  let server: http.Server;
  let requestCount = 0;
  let responseStatusCode = 200;
  let receivedHeaders: http.IncomingHttpHeaders = {};
  let originalBaseURL: string;
  let originalTimeout: number;

  beforeAll((done) => {
    jest.setTimeout(15000);
    // Capture originals
    originalBaseURL = apiClient.defaults.baseURL || '';
    originalTimeout = apiClient.defaults.timeout || 10000;

    // Direct override to mock server port and speed up test execution timeouts
    apiClient.defaults.baseURL = 'http://127.0.0.1:5001';
    apiClient.defaults.timeout = 500; // 500ms timeout for test verification

    // Spin up a local mock server on port 5001
    server = http.createServer((req, res) => {
      requestCount++;
      receivedHeaders = req.headers;

      res.writeHead(responseStatusCode, { 'Content-Type': 'application/json' });
      if (responseStatusCode === 200) {
        res.end(JSON.stringify({ success: true, message: 'OK' }));
      } else {
        res.end(JSON.stringify({ success: false, error: 'Mock Server Error' }));
      }
    });

    server.listen(5001, '127.0.0.1', () => {
      done();
    });
  });

  afterAll((done) => {
    // Restore originals
    apiClient.defaults.baseURL = originalBaseURL;
    apiClient.defaults.timeout = originalTimeout;

    server.close(() => {
      done();
    });
  });

  beforeEach(() => {
    requestCount = 0;
    responseStatusCode = 200;
    receivedHeaders = {};
    useAuthStore.setState({
      deviceId: null,
      sessionToken: null,
      user: null,
      isAuthenticated: false,
    });
  });

  test('1. Interceptor attaches Authorization Bearer token from Zustand auth store', async () => {
    // Arrange: Set a mock session token in Zustand authStore
    const testToken = 'mock-jwt-token-12345';
    useAuthStore.setState({ sessionToken: testToken });

    // Act: Send request via apiClient
    const response = await apiClient.get('/test');

    // Assert: Check server received the correct header and response was success
    expect(response.status).toBe(200);
    expect(receivedHeaders['authorization']).toBe(`Bearer ${testToken}`);
  });

  test('2. Client auto-retries failed requests up to 3 times on 500 errors', async () => {
    // Arrange: Configure server to fail twice (500) and then succeed (200)
    responseStatusCode = 500;
    
    // Dynamically override server behavior for retries
    server.removeAllListeners('request');
    server.on('request', (req, res) => {
      requestCount++;
      if (requestCount < 3) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Temporary Server Error' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      }
    });

    // Act: Make the request
    const response = await apiClient.get('/retry-test');

    // Assert: Request succeeds on 3rd attempt, verifying it retried
    expect(response.status).toBe(200);
    expect(requestCount).toBe(3); // 1 initial request + 2 retries
  });

  test('3. Client fails after max retry limit is exceeded', async () => {
    // Arrange: Keep returning 500 server errors
    server.removeAllListeners('request');
    server.on('request', (req, res) => {
      requestCount++;
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Fatal Server Error' }));
    });

    // Act & Assert: Should throw error after exhausting 1 initial request + 3 retries (total 4 attempts)
    await expect(apiClient.get('/fatal-test')).rejects.toThrow();
    expect(requestCount).toBe(4);
  }, 15000);

  test('4. Enforces 401 status handling by calling signOut to clear session credentials', async () => {
    // Arrange: Set mock credentials in Zustand and set server response status to 401
    const spySignOut = jest.spyOn(useAuthStore.getState(), 'signOut');
    useAuthStore.setState({ sessionToken: 'expired-token', isAuthenticated: true });
    
    server.removeAllListeners('request');
    server.on('request', (req, res) => {
      requestCount++;
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
    });

    // Act: Send request (expect it to throw 401)
    await expect(apiClient.get('/auth-test')).rejects.toThrow();

    // Assert: Ensure store sign out was triggered and sessionToken cleared
    expect(spySignOut).toHaveBeenCalled();
    expect(useAuthStore.getState().sessionToken).toBeNull();
    
    spySignOut.mockRestore();
  });

  test('5. Enforces client timeout setting', () => {
    // Assert: Check that default timeout matches the 10000ms architecture specification
    expect(originalTimeout).toBe(10000);
  });
});
