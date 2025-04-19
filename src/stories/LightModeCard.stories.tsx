import React from "react";
import LightModeCard from "../components/LightModeCard";

export default {
  title: "Components/LightModeCard",
  component: LightModeCard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    content: { control: "text" },
    primaryAction: { control: "text" },
    secondaryAction: { control: "text" },
    onPrimaryAction: { action: "primary clicked" },
    onSecondaryAction: { action: "secondary clicked" },
  },
};

export const Default = {
  args: {
    title: "Light Mode Card",
    description: "A card that adapts to light and dark mode",
    content:
      "This component automatically adapts to your theme settings using CSS variables and Tailwind's theme system.",
    primaryAction: "Save Changes",
    secondaryAction: "Cancel",
  },
};

export const WithLongContent = {
  args: {
    title: "Content Rich Card",
    description: "A card with more detailed content",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    primaryAction: "Proceed",
    secondaryAction: "Go Back",
  },
};

export const CustomActions = {
  args: {
    title: "Custom Actions Card",
    description: "A card with custom action buttons",
    content: "This card demonstrates how to customize the action buttons.",
    primaryAction: "Submit Form",
    secondaryAction: "Reset Fields",
  },
};

export const MinimalContent = {
  args: {
    title: "Minimal Card",
    description: "Just the essentials",
    content: "A card with minimal content for simple use cases.",
    primaryAction: "OK",
    secondaryAction: "Cancel",
  },
};
