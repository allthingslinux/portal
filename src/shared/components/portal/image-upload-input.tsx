"use client";

import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import type { FormEvent, MouseEventHandler } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { cn } from "../lib/utils";
import { If } from "./if";

type Props = Omit<React.InputHTMLAttributes<unknown>, "value"> & {
  image?: string | null;
  onClear?: () => void;
  onValueChange?: (props: { image: string; file: File }) => void;
  visible?: boolean;
} & React.ComponentPropsWithRef<"input">;

const IMAGE_SIZE = 22;

export const ImageUploadInput: React.FC<Props> =
  function ImageUploadInputComponent({
    children,
    image,
    onClear,
    onInput,
    onValueChange,
    ref: forwardedRef,
    visible = true,
    ...props
  }) {
    const localRef = useRef<HTMLInputElement>(null);
    const inputId = props.id ?? "image-upload-input";

    const [state, setState] = useState({
      image,
      fileName: "",
    });

    const onInputChange = useCallback(
      (e: FormEvent<HTMLInputElement>) => {
        e.preventDefault();

        const files = e.currentTarget.files;

        if (files?.length) {
          const file = files[0];

          if (!file) {
            return;
          }

          const data = URL.createObjectURL(file);

          setState({
            image: data,
            fileName: file.name,
          });

          if (onValueChange) {
            onValueChange({
              image: data,
              file,
            });
          }
        }

        if (onInput) {
          onInput(e);
        }
      },
      [onInput, onValueChange]
    );

    const onRemove = useCallback(() => {
      setState({
        image: "",
        fileName: "",
      });

      if (localRef.current) {
        localRef.current.value = "";
      }

      if (onClear) {
        onClear();
      }
    }, [onClear]);

    const imageRemoved: MouseEventHandler = useCallback(
      (e) => {
        e.preventDefault();

        onRemove();
      },
      [onRemove]
    );

    const setRef = useCallback(
      (input: HTMLInputElement) => {
        localRef.current = input;

        if (typeof forwardedRef === "function") {
          forwardedRef(localRef.current);
        }
      },
      [forwardedRef]
    );

    if (image !== state.image) {
      setState((prevState) => ({ ...prevState, image }));
    }

    useEffect(() => {
      if (!image) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        onRemove();
      }
    }, [image, onRemove]);

    if (!visible) {
      return <Input {...props} onInput={onInputChange} ref={setRef} />;
    }

    return (
      <label
        className={
          "relative flex h-10 w-full cursor-pointer rounded-md border border-input border-dashed bg-background px-3 py-2 text-sm outline-hidden ring-primary ring-offset-2 ring-offset-background transition-all file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus:ring-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        }
        htmlFor={inputId}
      >
        <Input id={inputId} onInput={onInputChange} ref={setRef} />

        <div className={"flex items-center space-x-4"}>
          <div className={"flex"}>
            <If condition={!state.image}>
              <UploadCloud className={"h-5 text-muted-foreground"} />
            </If>

            <If condition={state.image}>
              <Image
                alt={props.alt ?? ""}
                className={"object-contain"}
                height={IMAGE_SIZE}
                loading={"lazy"}
                src={state.image ?? ""}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                }}
                width={IMAGE_SIZE}
              />
            </If>
          </div>

          <If condition={!state.image}>
            <div className={"flex flex-auto"}>
              <Label className={"cursor-pointer text-xs"}>{children}</Label>
            </div>
          </If>

          <If condition={state.image}>
            <div className={"flex flex-auto"}>
              <If
                condition={state.fileName}
                fallback={
                  <Label className={"cursor-pointer truncate text-xs"}>
                    {children}
                  </Label>
                }
              >
                <Label className={"truncate text-xs"}>{state.fileName}</Label>
              </If>
            </div>
          </If>

          <If condition={state.image}>
            <Button
              className={"h-5! w-5!"}
              onClick={imageRemoved}
              size={"icon"}
            >
              <X className="h-4" />
            </Button>
          </If>
        </div>
      </label>
    );
  };

function Input(
  props: React.InputHTMLAttributes<unknown> & {
    ref: (input: HTMLInputElement) => void;
  }
) {
  return (
    <input
      {...props}
      accept="image/*"
      aria-labelledby={"image-upload-input"}
      className={cn("hidden", props.className)}
      type={"file"}
    />
  );
}
