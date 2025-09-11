import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
    </Card>
  ),
};

export const WithoutDescription: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card Content without description</p>
      </CardContent>
    </Card>
  ),
};

export const OnlyContent: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent>
        <p>Card with only content</p>
      </CardContent>
    </Card>
  ),
};

export const WithLongContent: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Long Content Card</CardTitle>
        <CardDescription>
          This is a longer description that demonstrates how the card handles
          multiple lines of text content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          This is a longer content section that shows how the card component
          handles extended text content. It should wrap properly and maintain
          good spacing.
        </p>
      </CardContent>
    </Card>
  ),
};
