import { forwardRef } from 'react';
import type { ComponentProps, ElementRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { with42dotSans } from './fontResolver';

type AppTextInputProps = ComponentProps<typeof RNTextInput> & { className?: string };

const AppTextInput = forwardRef<ElementRef<typeof RNTextInput>, AppTextInputProps>(
  ({ style, className, ...props }, ref) => {
    return (
      <RNTextInput
        ref={ref}
        {...props}
        className={className}
        style={with42dotSans(style, className)}
      />
    );
  },
);

AppTextInput.displayName = 'AppTextInput';

export default AppTextInput;
