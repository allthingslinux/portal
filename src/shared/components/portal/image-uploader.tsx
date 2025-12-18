"use client";

import { Image as ImageIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "~/components/ui/button";
import { ImageUploadInput } from "./image-upload-input";
import { Trans } from "./trans";

export function ImageUploader(
  props: React.PropsWithChildren<{
    value: string | null | undefined;
    onValueChange: (value: File | null) => unknown;
  }>
) {
  const [image, setImage] = useState(props.value);

  const { setValue, register } = useForm<{
    value: string | null | FileList;
  }>({
    defaultValues: {
      value: props.value,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const control = register("value");
  const inputId = "image-uploader-input";

  const onClear = useCallback(() => {
    props.onValueChange(null);
    setValue("value", null);
    setImage("");
  }, [props, setValue]);

  const onValueChange = useCallback(
    ({ image: nextImage, file }: { image: string; file: File }) => {
      props.onValueChange(file);

      setImage(nextImage);
    },
    [props]
  );

  if (props.value !== image) {
    setImage(props.value);
  }

  if (!image) {
    return (
      <FallbackImage descriptionSection={props.children} inputId={inputId}>
        <ImageUploadInput
          {...control}
          accept={"image/*"}
          className={"absolute h-full w-full"}
          id={inputId}
          multiple={false}
          onValueChange={onValueChange}
          visible={false}
        />
      </FallbackImage>
    );
  }

  return (
    <div className={"flex items-center space-x-4"}>
      <label
        className={
          "fade-in zoom-in-50 group/label relative size-20 animate-in cursor-pointer"
        }
        htmlFor={inputId}
      >
        {/* biome-ignore lint/performance/noImgElement: local blob preview */}
        <img
          alt={""}
          className={
            "size-20 rounded-full object-cover transition-all duration-300 group-hover/label:opacity-80"
          }
          decoding="async"
          height={80}
          src={image}
          width={80}
        />

        <ImageUploadInput
          {...control}
          accept={"image/*"}
          className={"absolute h-full w-full"}
          id={inputId}
          multiple={false}
          onValueChange={onValueChange}
          visible={false}
        />
      </label>

      <div>
        <Button onClick={onClear} size={"sm"} variant={"ghost"}>
          <Trans i18nKey={"common:clear"} />
        </Button>
      </div>
    </div>
  );
}

function FallbackImage(
  props: React.PropsWithChildren<{
    descriptionSection?: React.ReactNode;
    inputId: string;
  }>
) {
  return (
    <div className={"flex items-center space-x-4"}>
      <label
        className={
          "fade-in zoom-in-50 relative flex size-20 animate-in cursor-pointer flex-col items-center justify-center rounded-full border border-border hover:border-primary"
        }
        htmlFor={props.inputId}
      >
        <ImageIcon className={"h-8 text-primary"} />

        {props.children}
      </label>

      {props.descriptionSection}
    </div>
  );
}
