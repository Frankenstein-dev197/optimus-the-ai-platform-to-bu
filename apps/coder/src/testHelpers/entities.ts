// Mock entities for testing
import type { User } from "#/api/typesGenerated";

export const MockCustomNotificationTemplates = [];
export const MockNotificationMethodsResponse = {};
export const MockSystemNotificationTemplates = [];
export const MockUserOwner: User = {
  id: "test-user",
  username: "testuser",
  email: "test@example.com",
  name: "Test User",
  avatar_url: "",
  organization_ids: [],
  roles: [],
  has_ai_seat: false,
  login_type: "password",
  created_at: "",
  last_seen_at: "",
  updated_at: "",
  status: "active",
};
