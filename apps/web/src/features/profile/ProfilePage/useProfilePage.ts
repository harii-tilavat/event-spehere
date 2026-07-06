import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useChangePassword, useUpdateMyOrganizerProfile, useUpdateProfile } from "@/api";
import { useAuth } from "@/context/AuthContext";
import {
  changePasswordFormSchema,
  organizerProfileFormSchema,
  profileFormSchema,
  type ChangePasswordFormValues,
  type OrganizerProfileFormValues,
  type ProfileFormValues,
} from "./types";

export function useProfilePage() {
  const { user, setUser } = useAuth();

  // ----- basic profile -----
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" },
  });

  useEffect(() => {
    if (user) profileForm.reset({ name: user.name, phone: user.phone ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-sync when the session user changes
  }, [user?.id]);

  const updateProfile = useUpdateProfile({
    onSuccess: (updated) => {
      setUser({ ...updated, organizerProfile: user?.organizerProfile ?? updated.organizerProfile });
      toast.success("Profile updated");
    },
  });

  const handleAvatarChange = (url: string | null) => updateProfile.mutate({ avatarUrl: url });

  // ----- password -----
  const passwordForm = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordFormSchema) });
  const changePassword = useChangePassword({
    onSuccess: ({ message }) => {
      toast.success(message);
      passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
  });

  // ----- organizer profile -----
  const isOrganizer = user?.role === "organizer";
  const organizerForm = useForm<OrganizerProfileFormValues>({
    resolver: zodResolver(organizerProfileFormSchema),
    defaultValues: {
      organizationName: user?.organizerProfile?.organizationName ?? "",
      description: user?.organizerProfile?.description ?? "",
      website: user?.organizerProfile?.website ?? "",
    },
  });
  const updateOrganizerProfile = useUpdateMyOrganizerProfile({
    onSuccess: (profile) => {
      if (user) setUser({ ...user, organizerProfile: profile });
      toast.success("Organization profile updated");
    },
  });

  return {
    user,
    profileForm,
    profileErrors: profileForm.formState.errors,
    isSavingProfile: updateProfile.isPending,
    handleProfileSubmit: profileForm.handleSubmit((values) =>
      updateProfile.mutate({ name: values.name, phone: values.phone || undefined }),
    ),
    handleAvatarChange,
    passwordForm,
    passwordErrors: passwordForm.formState.errors,
    isChangingPassword: changePassword.isPending,
    handlePasswordSubmit: passwordForm.handleSubmit((values) =>
      changePassword.mutate({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    ),
    isOrganizer,
    organizerForm,
    organizerErrors: organizerForm.formState.errors,
    isSavingOrganizer: updateOrganizerProfile.isPending,
    handleOrganizerSubmit: organizerForm.handleSubmit((values) =>
      updateOrganizerProfile.mutate({
        organizationName: values.organizationName,
        description: values.description || null,
        website: values.website || null,
      }),
    ),
  };
}
