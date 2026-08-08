// Storybook helpers stub
/* eslint-disable @typescript-eslint/no-explicit-any */

// Simple decorator function type
type DecoratorFn = (story: any, context?: any) => any;

// Decorators as functions that return decorators
export const withAuthProvider: any = (story: any) => story;
export const withDashboardProvider: any = (story: any) => story;
export const withOrganizationSettingsProvider: any = (story: any) => story;
export const withToaster: any = (story: any) => story;
export const withDesktopViewport: any = (story: any) => story;
export const withWebSocket: any = (story: any) => story;

// withProxyProvider can be called with or without options
export const withProxyProvider: any = ((options?: unknown) => (story: any) => story);
