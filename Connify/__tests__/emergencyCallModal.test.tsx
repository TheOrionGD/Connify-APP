import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { EmergencyCallModal } from '../src/components/call/EmergencyCallModal';
import { useCallStore } from '../src/stores/callStore';

describe('EmergencyCallModal Component', () => {
  let renderedComponents: ReactTestRenderer.ReactTestRenderer[] = [];

  beforeEach(() => {
    useCallStore.getState().resetCall();
    jest.clearAllMocks();
  });

  afterEach(() => {
    useCallStore.getState().resetCall();
    ReactTestRenderer.act(() => {
      renderedComponents.forEach((c) => {
        try {
          c.unmount();
        } catch (e) {}
      });
      renderedComponents = [];
    });
  });

  test('1. Renders counterparty name and role for outgoing call', () => {
    useCallStore.getState().startOutgoingCall('ep-100', 'Volunteer Dave', 'responder');

    let component: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <EmergencyCallModal
          visible={true}
          onClose={jest.fn()}
          episodeId="ep-100"
          counterpartyName="Volunteer Dave"
          role="responder"
        />
      );
      renderedComponents.push(component);
    });

    const texts = component!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Volunteer Dave');
    expect(texts).toContain('VOLUNTEER RESPONDER');
  });

  test('2. Renders incoming call controls with ACCEPT and DECLINE buttons', () => {
    useCallStore.getState().receiveIncomingCall('ep-200', 'Requester Alice', 'requester');

    let component: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <EmergencyCallModal
          visible={true}
          onClose={jest.fn()}
          episodeId="ep-200"
          counterpartyName="Requester Alice"
          role="requester"
        />
      );
      renderedComponents.push(component);
    });

    const texts = component!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Requester Alice');
    expect(texts).toContain('ACCEPT');
    expect(texts).toContain('DECLINE');
  });

  test('3. Renders connected call controls with MUTE and SPEAKER options', () => {
    useCallStore.getState().startOutgoingCall('ep-300', 'Peer Bob', 'responder');
    useCallStore.getState().setConnected();

    let component: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <EmergencyCallModal
          visible={true}
          onClose={jest.fn()}
          episodeId="ep-300"
          counterpartyName="Peer Bob"
          role="responder"
        />
      );
      renderedComponents.push(component);
    });

    const texts = component!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('MUTE');
    expect(texts).toContain('SPEAKER');
    expect(texts).toContain('END CALL');
  });
});
