import { Button, Card, CardContent, CardHeader, CardTitle, FormField, Input, PageHeader, Textarea } from "@eventsphere/ui";
import { ImageUploader } from "@/components";
import { useProfilePage } from "./useProfilePage";

export function ProfilePage() {
  const {
    user,
    profileForm,
    profileErrors,
    isSavingProfile,
    handleProfileSubmit,
    handleAvatarChange,
    passwordForm,
    passwordErrors,
    isChangingPassword,
    handlePasswordSubmit,
    isOrganizer,
    organizerForm,
    organizerErrors,
    isSavingOrganizer,
    handleOrganizerSubmit,
  } = useProfilePage();

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Profile" description={user.email} />

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
            <FormField label="Avatar" htmlFor="p-avatar">
              <ImageUploader value={user.avatarUrl} onChange={handleAvatarChange} folder="avatars" label="Upload avatar" />
            </FormField>
            <FormField label="Full name" htmlFor="p-name" error={profileErrors.name?.message}>
              <Input id="p-name" {...profileForm.register("name")} />
            </FormField>
            <FormField label="Phone" htmlFor="p-phone" error={profileErrors.phone?.message} hint="10 digits, optional">
              <Input id="p-phone" inputMode="numeric" {...profileForm.register("phone")} />
            </FormField>
            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isOrganizer && (
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOrganizerSubmit} className="space-y-4" noValidate>
              <FormField label="Organization name" htmlFor="o-name" error={organizerErrors.organizationName?.message}>
                <Input id="o-name" {...organizerForm.register("organizationName")} />
              </FormField>
              <FormField label="Description" htmlFor="o-desc" error={organizerErrors.description?.message}>
                <Textarea id="o-desc" rows={3} {...organizerForm.register("description")} />
              </FormField>
              <FormField label="Website" htmlFor="o-web" error={organizerErrors.website?.message} hint="https://…">
                <Input id="o-web" type="url" {...organizerForm.register("website")} />
              </FormField>
              <Button type="submit" disabled={isSavingOrganizer}>
                {isSavingOrganizer ? "Saving…" : "Save organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
            <FormField label="Current password" htmlFor="pw-current" error={passwordErrors.currentPassword?.message}>
              <Input id="pw-current" type="password" autoComplete="current-password" {...passwordForm.register("currentPassword")} />
            </FormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="New password"
                htmlFor="pw-new"
                error={passwordErrors.newPassword?.message}
                hint="8+ chars, uppercase + digit"
              >
                <Input id="pw-new" type="password" autoComplete="new-password" {...passwordForm.register("newPassword")} />
              </FormField>
              <FormField label="Confirm" htmlFor="pw-confirm" error={passwordErrors.confirmPassword?.message}>
                <Input id="pw-confirm" type="password" autoComplete="new-password" {...passwordForm.register("confirmPassword")} />
              </FormField>
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? "Updating…" : "Change password"}
            </Button>
            <p className="text-xs text-muted-foreground">Changing your password signs you out on other devices.</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
