import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';

import { StandardButton } from '../src/components/buttons/StandardButton';
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
      const onPressSpy = jest.fn();
      const component = render(
        <StandardButton title="Submit" onPress={onPressSpy} />
      );
      
      const textComponent = component.root.findByType(Text);
      expect(textComponent.props.children).toBe('Submit');

      const touchable = component.root.findByType(TouchableOpacity);
      touchable.props.onPress();
      expect(onPressSpy).toHaveBeenCalledTimes(1);
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
      const onPressSpy = jest.fn();
      const component = render(
        <StandardButton title="Submit" onPress={onPressSpy} disabled />
      );

      const touchable = component.root.findByType(TouchableOpacity);
      expect(touchable.props.disabled).toBe(true);
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
      const onChangeSpy = jest.fn();
      const component = render(
        <TextField 
          label="Email Address" 
          placeholder="Enter email"
          value="test@test.com"
          onChangeText={onChangeSpy}
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
      expect(onChangeSpy).toHaveBeenCalledWith('new@test.com');

      // Error text validation
      const errorText = component.root.findAllByType(Text)[1];
      expect(errorText.props.children).toBe('Invalid email format');
    });
  });

  describe('DialogueModal', () => {
    test('renders dialogue info and buttons when visible', () => {
      const onCloseSpy = jest.fn();
      const onConfirmSpy = jest.fn();

      const component = render(
        <DialogueModal
          visible={true}
          title="Delete Item"
          message="Are you sure?"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
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
      expect(onCloseSpy).toHaveBeenCalled();

      // Confirm press
      touchables[1].props.onPress();
      expect(onConfirmSpy).toHaveBeenCalled();
    });
  });
});
