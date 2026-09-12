import type { ComponentPropsWithRef } from 'react';
import { useLayoutEffect, useRef } from 'react';

import classNames from 'classnames';

import { useMergedRefs } from '@/flavours/glitch/hooks/useMergedRefs';
import { useOnClickOutside } from '@/flavours/glitch/hooks/useOnClickOutside';
import { useScrollSensor } from '@/flavours/glitch/hooks/useScrollSensor';

import classes from './styles.module.scss';

interface BottomSheetProps extends Omit<
  ComponentPropsWithRef<'dialog'>,
  'onClose'
> {
  onClose: (e: Event) => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  className,
  onClose,
  ...props
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();

    return () => {
      dialog.requestClose();
    };
  }, []);

  useOnClickOutside(contentRef, (e) => {
    onClose(e);
  });

  const { sensor, isInViewport } = useScrollSensor({
    placement: 'bottom',
    tolerance: 10,
  });

  return (
    <dialog
      {...props}
      className={classNames(
        classes.dialog,
        !isInViewport && classes.withGradient,
      )}
      ref={useMergedRefs(props.ref, dialogRef)}
    >
      <div ref={contentRef} className={classNames(className, classes.sheet)}>
        {children}
      </div>
      {sensor}
    </dialog>
  );
};
