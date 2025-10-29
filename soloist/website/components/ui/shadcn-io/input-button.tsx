'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputButtonContextType {
  showInput: boolean;
  setShowInput: (show: boolean) => void;
  transition: Transition;
  id: string;
}

const InputButtonContext = React.createContext<
  InputButtonContextType | undefined
>(undefined);

const useInputButton = () => {
  const context = React.useContext(InputButtonContext);
  if (!context) {
    throw new Error(
      'InputButton components must be used within InputButtonProvider'
    );
  }
  return context;
};

interface InputButtonProviderProps {
  children: React.ReactNode;
  showInput?: boolean;
  setShowInput?: (show: boolean) => void;
  transition?: Transition;
  id?: string;
}

export const InputButtonProvider: React.FC<InputButtonProviderProps> = ({
  children,
  showInput: externalShowInput,
  setShowInput: externalSetShowInput,
  transition = { type: 'spring', stiffness: 300, damping: 20 },
  id: externalId,
}) => {
  const [internalShowInput, setInternalShowInput] = React.useState(false);
  const generatedId = React.useId();

  const showInput = externalShowInput ?? internalShowInput;
  const setShowInput = externalSetShowInput ?? setInternalShowInput;
  const id = externalId ?? generatedId;

  return (
    <InputButtonContext.Provider
      value={{ showInput, setShowInput, transition, id }}
    >
      {children}
    </InputButtonContext.Provider>
  );
};

interface InputButtonProps {
  children: React.ReactNode;
  className?: string;
}

export const InputButton: React.FC<InputButtonProps> = ({
  children,
  className,
}) => {
  const { id, transition } = useInputButton();

  return (
    <motion.div
      layoutId={id}
      transition={transition}
      className={cn(
        'relative flex items-center overflow-hidden rounded-full border border-border bg-background',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface InputButtonActionProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const InputButtonAction: React.FC<InputButtonActionProps> = ({
  onClick,
  children,
  className,
}) => {
  const { showInput, setShowInput } = useInputButton();

  if (showInput) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setShowInput(true);
        onClick?.();
      }}
      className={cn(
        'px-4 py-0 text-sm font-medium text-foreground transition-colors hover:bg-accent',
        className
      )}
    >
      {children}
    </button>
  );
};

interface InputButtonSubmitProps {
  icon?: React.ElementType;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const InputButtonSubmit: React.FC<InputButtonSubmitProps> = ({
  icon: Icon = ArrowRight,
  children,
  disabled = false,
  className,
}) => {
  const { showInput } = useInputButton();

  if (!showInput) return null;

  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50',
        className
      )}
    >
      {children}
      <Icon className="h-4 w-4" />
    </button>
  );
};

interface InputButtonInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const InputButtonInput: React.FC<InputButtonInputProps> = ({
  className,
  type = 'text',
  ...props
}) => {
  const { showInput } = useInputButton();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  if (!showInput) return null;

  return (
    <input
      ref={inputRef}
      type={type}
      className={cn(
        'flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
};
