

import useGetVAT from './data/useGetVAT';
import React, { useState, useEffect } from 'react';
import {
  render,
  Banner,
  TextField,
  useTranslate,
  BlockSpacer,
  useExtensionCapability,
  useBuyerJourneyIntercept,
  useApplyMetafieldsChange,
  useCustomer 
} from '@shopify/checkout-ui-extensions-react';

render('Checkout::Contact::RenderAfter', () => <App />);

function App() {

  // Use the translate function
  const translate = useTranslate();

  const vatCodeLabel = translate("vat_code_label");
  const rppsNumberLabel = translate("rpps_number_label");
  const vatErrorMessage = translate("vat_error_message");

  

  // Set a function to handle updating a metafield
  const applyMetafieldsChange = useApplyMetafieldsChange();

  const customer = useCustomer();

  // Set up the app state
  const [vatCode, setVatCode] = useState("");
  const [rppsNumber, setRppsNumber] = useState("");
  const [validationError, setValidationError] = useState("");
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  // Merchants can toggle the `block_progress` capability behavior within the checkout editor
  // To give the best preview experience, ensure that your extension updates its UI accordingly
  // For this example, the extension subscribes to `capabilities`, and updates the `label` and `required` attributes for the `TextField` component
  const canBlockProgress = useExtensionCapability("block_progress");

  // If vatCode is not valid, show validation errors
  useEffect(async() => {
    console.log(customer)
    if (canBlockProgress && !await isVatValid()) {
      showValidationErrors();
      return;
    }
    clearValidationErrors();
  }, [vatCode]);

  // Use the `buyerJourney` intercept to conditionally block checkout progress
  useBuyerJourneyIntercept(async() => {
    if (! await isVatValid()) {
      return {
        behavior: "block",
        reason: "VTA is not valid",
        perform: (result) => {
          // If progress can be blocked, then set a validation error, and show the banner
          if (result.behavior === "block") {
            showValidationErrors();
          }
        },
      };
    }
    
    return {
      behavior: "allow",
      perform: () => {
        // Ensure any errors are hidden
        clearValidationErrors();
      },
    };
  });

  async function isVatValid() {
    if(vatCode){
      const afterValid = await useGetVAT(vatCode);
      if(afterValid===undefined || !afterValid){return false}
      if(afterValid){
        // Apply the change to the vat metafield
        applyMetafieldsChange({
          type: "updateMetafield",
          namespace: "custom",
          key: "vat_code",
          valueType: "string",
          value: vatCode
        });
        return true;
      }
    }
    return true;
  }

  function showValidationErrors() {
    setShowErrorBanner(true);
  }

  function clearValidationErrors() {
    setValidationError("");
    setShowErrorBanner(false);
  }

  return (
    <>
      {showErrorBanner && (
        <Banner status="critical">
          {vatErrorMessage}
        </Banner>
      )}
      <TextField
        label={vatCodeLabel}
        value={vatCode}
        onChange={setVatCode}
        onInput={clearValidationErrors}
        required={canBlockProgress}
        error={validationError}
      ></TextField>
      <BlockSpacer spacing='tight'></BlockSpacer>
      <TextField
        label={rppsNumberLabel}
        value={rppsNumber}
        	onChange={(value) => {
            // Apply the change to the rpps metafield
            setRppsNumber(value)
            applyMetafieldsChange({
              type: "updateMetafield",
              namespace: "custom",
              key: "rpps_number",
              valueType: "string",
              value,
            });
          }}
      ></TextField>
    </>
  );
}