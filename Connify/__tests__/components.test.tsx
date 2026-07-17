import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity, TextInput, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';

import { StandardButton } from '../src/components/buttons/StandardButton';
import { SOSButton } from '../src/components/buttons/SOSButton';
import { SafetyCard } from '../src/components/cards/SafetyCard';
import { StandardCard } from '../src/components/cards/StandardCard';
import { TextField } from '../src/components/inputs/TextField';
import { DialogueModal } from '../src/components/common/DialogueModal';

describe('UI Components Unit Tests', () => {
  let renderedComponents: ReactTestRenderer.ReactTestRenderer[] = [];

  const render = (element: React.ReactElement) => {
    let component: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(element);
      renderedComponents.push(component);
    });
    return component!;
  };

  afterEach(() => {
    ReactTestRenderer.act(() => {
      renderedComponents.forEach((c) => {
        try {
          c.unmount();
        } catch (e) {
          // ignore
        }
      });
      renderedComponents = [];
    });
  });

  describe('StandardButton', () => {
    test('renders title and triggers onPress', () => {
      const onPressMock = jest.fn();
      const component = render(
        <StandardButton title="Submit" onPress={onPressMock} />
      );
      
      const textComponent = component.root.findByType(Text);
      expect(textComponent.props.children).toBe('Submit');

      const touchable = component.root.findByType(TouchableOpacity);
      touchable.props.onPress();
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    test('renders activity indicator when loading', () => {
      const component = render(
        <StandardButton title="Submit" onPress={jest.fn()} loading />
      );
      
      // Should find ActivityIndicator
      const indicator = component.root.findByType(ActivityIndicator);
      expect(indicator).toBeDefined();

      // Text should not be rendered
      expect(() => component.root.findByType(Text)).toThrow();
    });

    test('is disabled when loading or disabled prop is true', () => {
      const onPressMock = jest.fn();
      const component = render(
        <StandardButton title="Submit" onPress={onPressMock} disabled />
      );

      const touchable = component.root.findByType(TouchableOpacity);
      expect(touchable.props.disabled).toBe(true);
    });
  });

  describe('SOSButton', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('renders SOS text and handles hold-to-trigger workflow', () => {
      const onTriggerMock = jest.fn();
      const component = render(
        <SOSButton onTrigger={onTriggerMock} holdDurationMs={2000} />
      );

      const texts = component.root.findAllByType(Text);
      expect(texts[0].props.children).toBe('SOS');
      expect(texts[1].props.children).toBe('HOLD TO TRIGGER');

      const touchable = component.root.findByType(TouchableWithoutFeedback);
      
      // Simulate press in
      touchable.props.onPressIn();
      
      // Advance timers by less than hold duration
      ReactTestRenderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(onTriggerMock).not.toHaveBeenCalled();

      // Advance remaining time
      ReactTestRenderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(onTriggerMock).toHaveBeenCalledTimes(1);
    });

    test('clears timeout if pressed out before duration', () => {
      const onTriggerMock = jest.fn();
      const component = render(
        <SOSButton onTrigger={onTriggerMock} holdDurationMs={2000} />
      );

      const touchable = component.root.findByType(TouchableWithoutFeedback);
      
      touchable.props.onPressIn();
      ReactTestRenderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      touchable.props.onPressOut();

      ReactTestRenderer.act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(onTriggerMock).not.toHaveBeenCalled();
    });
  });

  describe('Cards (SafetyCard & StandardCard)', () => {
    test('renders children in SafetyCard', () => {
      const component = render(
        <SafetyCard>
          <Text>Safety content</Text>
        </SafetyCard>
      );
      const text = component.root.findByType(Text);
      expect(text.props.children).toBe('Safety content');
    });

    test('renders children in StandardCard', () => {
      const component = render(
        <StandardCard>
          <Text>Standard content</Text>
        </StandardCard>
      );
      const text = component.root.findByType(Text);
      expect(text.props.children).toBe('Standard content');
    });
  });

  describe('TextField', () => {
    test('renders label, input, and handles errors', () => {
      const onChangeMock = jest.fn();
      const component = render(
        <TextField 
          label="Email Address" 
          placeholder="Enter email"
          value="test@test.com"
          onChangeText={onChangeMock}
          error="Invalid email format"
        />
      );

      // Label is converted to uppercase in TextField
      const labelText = component.root.findAllByType(Text)[0];
      expect(labelText.props.children).toBe('EMAIL ADDRESS');

      const input = component.root.findByType(TextInput);
      expect(input.props.placeholder).toBe('Enter email');
      expect(input.props.value).toBe('test@test.com');
      
      input.props.onChangeText('new@test.com');
      expect(onChangeMock).toHaveBeenCalledWith('new@test.com');

      // Error text validation
      const errorText = component.root.findAllByType(Text)[1];
      expect(errorText.props.children).toBe('Invalid email format');
    });
  });

  describe('DialogueModal', () => {
    test('renders dialogue info and buttons when visible', () => {
      const onCloseMock = jest.fn();
      const onConfirmMock = jest.fn();

      const component = render(
        <DialogueModal
          visible={true}
          title="Delete Item"
          message="Are you sure?"
          onClose={onCloseMock}
          onConfirm={onConfirmMock}
          cancelText="Cancel"
          confirmText="Yes, delete"
        />
      );

      const texts = component.root.findAllByType(Text);
      expect(texts[0].props.children).toBe('Delete Item');
      expect(texts[1].props.children).toBe('Are you sure?');

      // Cancel button text in uppercase
      expect(texts[2].props.children).toBe('CANCEL');
      // Confirm button text in uppercase
      expect(texts[3].props.children).toBe('YES, DELETE');

      const touchables = component.root.findAllByType(TouchableOpacity);
      
      // Cancel press
      touchables[0].props.onPress();
      expect(onCloseMock).toHaveBeenCalled();

      // Confirm press
      touchables[1].props.onPress();
      expect(onConfirmMock).toHaveBeenCalled();
    });
  });
});
