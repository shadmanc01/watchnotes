export type PublicProfile = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
};

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: PublicProfile | null;
};
