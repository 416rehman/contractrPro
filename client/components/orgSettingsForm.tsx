"use client";
import { updateOrganizationAndPersist, useUserStore } from "@/services/user";
import { useEffect, useState } from "react";
import { useToastsStore } from "@/services/toast";
import { OrganizationSetting } from "@/types";
import { Select, SelectItem } from "@nextui-org/select";

import currency from "@/public/data/currency.json";
import { Checkbox } from "@nextui-org/checkbox";
import { Accordion, AccordionItem, Input } from "@nextui-org/react";
import { MoonIcon, SunIcon } from "@nextui-org/shared-icons";

/**
 * The user form allows the user to edit their organization settings.
 */
export default function OrgSettingsForm() {
  const currentOrganization = useUserStore(state => state.currentOrganization);
  const addToast = useToastsStore(state => state.addToast);

  const [settings, setSettings] = useState<OrganizationSetting>();

  useEffect(() => {
    if (currentOrganization) {
      setSettings(currentOrganization.OrganizationSetting);
    }
  }, [currentOrganization]);

  function handleChange(e) {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const id = target.name;

    setSettings(prevState => ({
      ...prevState,
      [id]: value
    }));
  }

  function saveSettings() {
    if (currentOrganization) {
      currentOrganization.OrganizationSetting = settings;
      updateOrganizationAndPersist(currentOrganization).then(() => {
        addToast({
          id: "orgSettingsUpdated",
          title: "Organization Settings Updated",
          message: "Your organization settings have been updated.",
          type: "success"
        });
      });
    }
  }

  const currencyOptions = (
    <AccordionItem
      key="currencyOptions"
      aria-label="Currency"
      indicator={({ isOpen }) => (isOpen ? <SunIcon /> : <MoonIcon />)}
      title="Currency"
      subtitle={"Configure the default currency for all transactions."}
    >
      <div className={"flex flex-row justify-between gap-5"}>
        <Select
          label="Currency Symbol"
          placeholder="Select a currency symbol"
          className="max-w-xs"
          selectedKeys={new Set([settings?.currencySymbol])}
          name={"currencySymbol"}
          onChange={handleChange}
          onBlur={saveSettings}
        >
          {currency.symbols.map((symbol) => (
            <SelectItem key={symbol} value={symbol}>
              {symbol}
            </SelectItem>
          ))}
        </Select>
      </div>
    </AccordionItem>
  );

  const invoiceOptions = (
    <AccordionItem
      key="invoiceOptions"
      aria-label="Invoice"
      indicator={({ isOpen }) => (isOpen ? <SunIcon /> : <MoonIcon />)}
      title="Invoice"
      subtitle={"Configure the default settings for invoices."}
    >
      <div className={"flex flex-col justify-between gap-5 w-full overflow-x-hidden"}>
        <Checkbox isSelected={settings?.invoiceUseDateForNumber} name={"invoiceUseDateForNumber"} color={"secondary"}
                  onChange={handleChange} onBlur={saveSettings}>
          <div className={"flex flex-col"}>
            <p>Use Daily Sequential Numbering</p>
            <p className={"text-sm text-default-500 italic"}>
              i.e if the date is 2021-12-31, the invoice number will be 2021123101. Next invoice will be 2021123102.
            </p>
          </div>
        </Checkbox>
        <div className={"flex flex-row gap-2 justify-between"}>
          <div className={"flex flex-col"}>
            <p>Tax Rate</p>
            <p className={"text-sm text-default-500 italic"}>This will be used as the default tax rate for all
              invoices.</p>
          </div>
          <Input
            endContent={"%"}
            name={"invoiceDefaultTaxRate"}
            onChange={handleChange}
            type={"number"}
            min={0}
            max={100}
            step={1}
            value={"" + settings?.invoiceDefaultTaxRate}
            className={"max-w-fit"}
            placeholder={"e.g. 13"}
            onBlur={saveSettings}
          />
        </div>
        <div>
          <div className={"flex flex-col gap-2 justify-between"}>
            <div className={"flex flex-col"}>
              <p>Invoicing Terms</p>
              <p className={"text-sm text-default-500 italic"}>Invoice terms will be used as the default terms for all
                invoices.</p>
            </div>
            <Input
              name={"invoiceDefaultTerms"}
              onChange={handleChange}
              value={settings?.invoiceDefaultTerms || ""}
              placeholder={"e.g. Due on receipt"}
              onBlur={saveSettings}
            />
          </div>
        </div>
        <div className={"flex flex-col gap-2 justify-between flex-grow"}>
          <div className={"flex flex-row justify-between"}>
            <div className={"flex flex-col"}>
              <p>Footer Line 1</p>
              <p className={"text-sm text-default-500 italic"}>Customize the first line of the invoice footer.</p>
            </div>
            <Checkbox isSelected={settings?.invoiceBoldFooterLine1} name={"invoiceBoldFooterLine1"} color={"secondary"}
                      onChange={handleChange} onBlur={saveSettings}>
              <div className={"flex flex-col"}>
                <p>Bold</p>
                <p className={"text-sm text-default-500 italic"}>Display as bold text.</p>
              </div>
            </Checkbox>
          </div>
          <Input
            name={"invoiceFooterLine1"}
            onChange={handleChange}
            value={settings?.invoiceFooterLine1 || ""}
            placeholder={"e.g. Thank you for your business!"}
            onBlur={saveSettings}
          />
        </div>
        <div className={"flex flex-col gap-2 justify-between flex-grow"}>
          <div className={"flex flex-row justify-between"}>
            <div className={"flex flex-col"}>
              <p>Footer Line 2</p>
              <p className={"text-sm text-default-500 italic"}>Customize the second line of the invoice footer.</p>
            </div>
            <Checkbox isSelected={settings?.invoiceBoldFooterLine2} name={"invoiceBoldFooterLine2"} color={"secondary"}
                      onChange={handleChange} onBlur={saveSettings}>
              <div className={"flex flex-col"}>
                <p>Bold</p>
                <p className={"text-sm text-default-500 italic"}>Display as bold text.</p>
              </div>
            </Checkbox>
          </div>
          <Input
            name={"invoiceFooterLine2"}
            onChange={handleChange}
            value={settings?.invoiceFooterLine2 || ""}
            placeholder={"e.g. Business Number: 123456789"}
            onBlur={saveSettings}
          />
        </div>
      </div>
    </AccordionItem>
  );

  return (
    <div className={"md:w-1/2 w-full"}>
      <Accordion defaultExpandedKeys={["currencyOptions", "invoiceOptions"]}>
        {currencyOptions}
        {invoiceOptions}
      </Accordion>
    </div>
  );
}