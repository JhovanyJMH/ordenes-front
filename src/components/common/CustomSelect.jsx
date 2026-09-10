import React from "react";
import clsx from "clsx";
import Select from "react-select";

const variants = {
  underline: {
    control: "py-1 px-0 w-full text-lg text-gray-800 border-gray-500 bg-transparent border-0 border-b-2 hover:cursor-pointer",
    focus: "border-orange-900 appearance-none",
    nonFocus: "focus:outline-none focus:ring-0 focus:border-orange-400 peer",
  },
  boxed: {
    control: "min-h-[42px] w-full rounded-xl border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm hover:cursor-pointer",
    focus: "border-colorPrimario ring-2 ring-colorPrimario/20",
    nonFocus: "border-gray-200",
  },
};

export const CustomSelect = React.forwardRef(({ variant = "underline", className, ...props }, ref) => {
  const v = variants[variant] || variants.underline;
  const placeholderStyles = "text-gray-500 pl-1 py-0.5";
  const selectInputStyles = "pl-1 py-0.5";
  const valueContainerStyles = "p-1 gap-1";
  const singleValueStyles = "leading-7 ml-1";
  const multiValueStyles = "bg-gray-100 rounded items-center py-0.5 pl-2 pr-1 gap-1.5";
  const multiValueLabelStyles = "leading-6 py-0.5";
  const multiValueRemoveStyles = "border border-gray-200 bg-white hover:bg-red-50 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md";
  const indicatorsContainerStyles = "p-1 gap-1";
  const menuStyles = "p-1 mt-1 border border-gray-200 bg-white rounded-xl shadow-xl";
  const groupHeadingStyles = "ml-3 mt-2 mb-1 text-gray-500 text-sm";
  const optionStyles = {
    base: "hover:cursor-pointer hover:text-slate-700 px-3 py-2 rounded-lg text-sm",
    focus: "bg-orange-100 active:bg-rose-900 active:text-white",
    selected: "bg-colorPrimario text-white",
  };
  const noOptionsMessageStyles = "text-gray-500 p-2 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-sm";

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  return (
    <div className={clsx("relative w-full", className)}>
      <Select
        ref={ref}
        closeMenuOnSelect
        hideSelectedOptions={false}
        menuPortalTarget={portalTarget}
        menuPosition="fixed"
        menuPlacement="auto"
        menuShouldScrollIntoView
        placeholder="Selecciona una opción"
        unstyled
        styles={{
          input: (base) => ({
            ...base,
            "input:focus": { boxShadow: "none" },
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          multiValueLabel: (base) => ({
            ...base,
            whiteSpace: "normal",
            overflow: "visible",
          }),
          control: (base) => ({ ...base, transition: "none" }),
        }}
        classNames={{
          control: ({ isFocused }) =>
            clsx(v.control, isFocused ? v.focus : v.nonFocus),
          placeholder: () => placeholderStyles,
          input: () => selectInputStyles,
          valueContainer: () => valueContainerStyles,
          singleValue: () => singleValueStyles,
          multiValue: () => multiValueStyles,
          multiValueLabel: () => multiValueLabelStyles,
          multiValueRemove: () => multiValueRemoveStyles,
          indicatorsContainer: () => indicatorsContainerStyles,
          menu: () => menuStyles,
          groupHeading: () => groupHeadingStyles,
          option: ({ isFocused, isSelected }) =>
            clsx(
              isFocused && optionStyles.focus,
              isSelected && optionStyles.selected,
              optionStyles.base,
            ),
          noOptionsMessage: () => noOptionsMessageStyles,
        }}
        {...props}
      />
    </div>
  );
});

export default CustomSelect;
