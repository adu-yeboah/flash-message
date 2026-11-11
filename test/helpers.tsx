import { StrictMode, type ReactNode } from "react";
import { render } from "@testing-library/react";
import { FlashMessageProvider, useFlashMessage } from "../src/index";
import type { FlashMessageProviderProps } from "../src/index";

/** The latest hook value, so tests can call showFlashMessage() etc. directly. */
export const ref: { api: ReturnType<typeof useFlashMessage> } = { api: undefined as never };

function Grab() {
  ref.api = useFlashMessage();
  return null;
}

type Props = Partial<Omit<FlashMessageProviderProps, "children">>;

export function mount(
  props: Props = {},
  { strict = false, children }: { strict?: boolean; children?: ReactNode } = {}
) {
  const tree = (
    <FlashMessageProvider {...props}>
      <Grab />
      {children}
    </FlashMessageProvider>
  );
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
}
