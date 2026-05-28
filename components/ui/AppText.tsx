import { forwardRef } from 'react';
import type { ComponentProps, ElementRef } from 'react';
import { Text as RNText } from 'react-native';
import { with42dotSans } from './fontResolver';

type AppTextProps = ComponentProps<typeof RNText> & { className?: string };

const AppText = forwardRef<ElementRef<typeof RNText>, AppTextProps>(
  ({ style, className, ...props }, ref) => {
    return (
      <RNText ref={ref} {...props} className={className} style={with42dotSans(style, className)} />
    );
  },
);

AppText.displayName = 'AppText';

export default AppText;
