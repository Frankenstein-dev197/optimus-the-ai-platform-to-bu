// Storybook helpers stub
import type { ReactElement } from "react";

type DecoratorFn = (story: () => ReactElement) => ReactElement;

export const withAuthProvider: DecoratorFn = (story) => story();
export const withDashboardProvider: DecoratorFn = (story) => story();
export const withOrganizationSettingsProvider: DecoratorFn = (story) => story();
export const withToaster: DecoratorFn = (story) => story();
