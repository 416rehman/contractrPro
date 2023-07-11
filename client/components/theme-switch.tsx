"use client";

import { FC } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@nextui-org/switch";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react";
import { Tooltip } from "@nextui-org/tooltip";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
  size?: "sm" | "md" | "lg";
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
                                                    size = "md",
                                                    className,
                                                    classNames
                                                  }) => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  const onChange = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps
  } = useSwitch({
    isSelected: theme === "light",
    "aria-label": `Switch to ${theme === "light" ? "dark" : "light"} mode`,
    onChange
  });

  return (
    <Tooltip content={theme === "light" ? "Dark mode" : "Light mode"}>
      <Component
        {...getBaseProps({
          className: clsx(
            "px-px transition-opacity hover:opacity-80 cursor-pointer",
            className,
            classNames?.base
          )
        })}
      >
        <VisuallyHidden>
          <input {...getInputProps()} />
        </VisuallyHidden>
        <div
          {...getWrapperProps()}
          className={slots.wrapper({
            class: clsx(
              [
                size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-10 h-10",
                "flex items-center justify-center",
                "rounded-lg bg-default-100 hover:bg-default-200",
                "m-0"
              ],
              classNames?.wrapper
            )
          })}
        >
          {!isSelected || isSSR ? <IconSunFilled size={22} /> : <IconMoonFilled size={22} />}
        </div>
      </Component>
    </Tooltip>
  );
};