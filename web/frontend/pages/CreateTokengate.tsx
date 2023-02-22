import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  ButtonGroup,
  Card,
  Form,
  Heading,
  Layout,
  Page,
  PageActions,
  Stack,
  TextContainer,
  TextField,
} from "@shopify/polaris";
import React from "react";

import { ContextualSaveBar, Toast } from "@shopify/app-bridge-react";
import { useField, useForm } from "@shopify/react-form";
import { useAuthenticatedFetch } from "../hooks";
import { TokengatesResourcePicker } from "../components/TokengatesResourcePicker";

import { Tokengate, Requirements, Reaction, UnlockingToken } from "@shopify/tokengate";

const getMockRequirements = (): Requirements => ({
  logic: "ANY" as const,
  conditions: [
    {
      name: "CryptoPunks",
      collectionAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
      imageUrl:
        "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&w=384",
    },
    {
      name: "Moonbirds",
      imageUrl:
        "https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?auto=format&w=384",
      collectionAddress: "0x23581767a106ae21c074b2276D25e5C3e136a68b",
    },
  ],
});
const getMockReaction = (): Reaction => ({
  type: "exclusive_access" as const,
});
const getMockUnlockingTokens = (): UnlockingToken[] => [
  {
    collectionAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
    collectionName: "CryptoPunks",
    imageUrl:
      "https://i.seadn.io/gae/ZWEV7BBCssLj4I2XD9zlPjbPTMcmR6gM9dSl96WqFHS02o4mucLaNt8ZTvSfng3wHfB40W9Md8lrQ-CSrBYIlAFa?auto=format&w=1000",
    name: "CryptoPunk #1719",
  },
  {
    collectionAddress: "0x23581767a106ae21c074b2276D25e5C3e136a68b",
    collectionName: "Moonbirds",
    imageUrl:
      "https://looksrare.mo.cloudinary.net/0x23581767a106ae21c074b2276D25e5C3e136a68b/0x66936fd157d67f7f12155b72f323b413ab7694f4d38d800b330b7ad16bc41f4d?resource_type=image&f=auto&c=limit&w=1600&q=auto:best",
    name: "#403 🪺",
  },
];

export default function CreateTokengate() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [toastProps, setToastProps] = useState({ content: null });

  const TokengateConfigured = (
    <Tokengate
      isLocked
      isConnected
      connectButton={<button>Connect wallet</button>}
      requirements={getMockRequirements()}
      reaction={getMockReaction()}
      unlockingTokens={getMockUnlockingTokens()}
    />
  );

  const fieldsDefinition = {
    name: useField({
      value: undefined,
      validates: (name) => !name && "Name cannot be empty",
    }),
    discountType: useField("percentage"),
    discount: useField({
      value: undefined,
      validates: (discount) => !discount && "Discount cannot be empty",
    }),
    segment: useField({
      value: undefined,
      validates: (segment) => !segment && "Segment cannot be empty",
    }),
    products: useField([]),
  };

  const { fields, submit, submitting, dirty, reset, makeClean } = useForm({
    fields: fieldsDefinition,
    onSubmit: async (formData) => {
      const { discountType, discount, name, products, segment } = formData;

      const productGids = products.map((product) => product.id);

      const response = await fetch("/api/gates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discountType,
          discount,
          name,
          productGids,
          segment: segment.split(","),
        }),
      });

      if (response.ok) {
        setToastProps({ content: "Tokengate created" });
        makeClean();
        navigate("/");
      } else {
        setToastProps({
          content: "There was an error creating a tokengate",
          error: true,
        });
      }
    },
  });

  const handleDiscountTypeButtonClick = useCallback(() => {
    if (fields.discountType.value === "percentage") {
      fields.discountType.onChange("amount");
    } else {
      fields.discountType.onChange("percentage");
    }
  }, [fields.discountType]);

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps({ content: null })} />
  );

  return (
    <Page
      narrowWidth
      breadcrumbs={[
        {
          content: "Go back",
          onAction: () => {
            navigate("/");
          },
        },
      ]}
      title="Create a new Tokengate"
    >
      <Layout>
        <Layout.Section>
          <Form onSubmit={submit}>
            <ContextualSaveBar
              saveAction={{
                onAction: submit,
                disabled: submitting || !dirty,
                loading: submitting,
              }}
              discardAction={{
                onAction: reset,
              }}
              visible={dirty}
            />
            {toastMarkup}
            <Layout>
              <Layout.Section>
                <Layout.Section>{TokengateConfigured}</Layout.Section>
                <Card>
                  <Card.Section>
                    <TextContainer>
                      <Heading>Configuration</Heading>
                      <TextField name="name" label="Name" type="text" {...fields.name} autoComplete="off" />
                    </TextContainer>
                  </Card.Section>
                  <Card.Section title="DISCOUNT PERK">
                    <Stack>
                      <Stack.Item>
                        <ButtonGroup segmented>
                          <Button
                            pressed={fields.discountType.value === "percentage"}
                            onClick={handleDiscountTypeButtonClick}
                          >
                            Percentage
                          </Button>
                          <Button
                            pressed={fields.discountType.value === "amount"}
                            onClick={handleDiscountTypeButtonClick}
                          >
                            Fixed Amount
                          </Button>
                        </ButtonGroup>
                      </Stack.Item>
                      <Stack.Item fill>
                        <TextField
                          name="discount"
                          type="number"
                          {...fields.discount}
                          autoComplete="off"
                          suffix={fields.discountType.value === "percentage" ? "%" : ""}
                          fullWidth
                        />
                      </Stack.Item>
                    </Stack>
                  </Card.Section>
                  <Card.Section title="SEGMENT">
                    <TextField
                      name="segment"
                      helpText="Comma separated list of contract addresses"
                      type="text"
                      placeholder="0x123, 0x456, 0x789"
                      {...fields.segment}
                      autoComplete="off"
                    />
                  </Card.Section>
                </Card>
              </Layout.Section>
              <Layout.Section>
                <TokengatesResourcePicker products={fields.products} />
              </Layout.Section>
              <Layout.Section>
                <PageActions
                  primaryAction={{
                    content: "Save",
                    disabled: submitting || !dirty,
                    loading: submitting,
                    onAction: submit,
                  }}
                />
              </Layout.Section>
            </Layout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
