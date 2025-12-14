import api from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export interface registerParams {
	firstName: string;
	lastName: string;
	middleName?: string;
	phone: string;
	email: string;
	password: string;
	age?: number;
	role: string;
	gender: string;
	avatar?: string | File;
	address?: string;
	bio?: string;
	studentId?: string;
	instructorId?: string;
	departmentId?: string;
	program?: string;
	specialization?: string;
	yearLevel?: string;
}

const register = async (userData: registerParams) => {
	const formData = new FormData();

	formData.append("firstName", userData.firstName);
	formData.append("lastName", userData.lastName);
	formData.append("phone", userData.phone);
	formData.append("email", userData.email);
	formData.append("password", userData.password);
	if (userData.age) {
		formData.append("age", userData.age.toString());
	}
	formData.append("gender", userData.gender);
	formData.append("role", userData.role);
	
	if (userData.middleName) {
		formData.append("middleName", userData.middleName);
	}
	if (userData.address) {
		formData.append("address", userData.address);
	}
	if (userData.bio) {
		formData.append("bio", userData.bio);
	}
	if (userData.studentId) {
		formData.append("studentId", userData.studentId);
	}
	if (userData.instructorId) {
		formData.append("instructorId", userData.instructorId);
	}
	if (userData.departmentId) {
		formData.append("departmentId", userData.departmentId);
	}
	if (userData.program) {
		formData.append("program", userData.program);
	}
	if (userData.specialization) {
		formData.append("specialization", userData.specialization);
	}
	if (userData.yearLevel) {
		formData.append("yearLevel", userData.yearLevel);
	}
	if (userData.avatar) {
		if (userData.avatar instanceof File) {
			formData.append("avatar", userData.avatar);
		} else {
			formData.append("avatar", userData.avatar);
		}
	}

	try {
		const res = await api.post("/user/register", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message);
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error in registration request: " + error.message);
		}
	}
};

export const useRegister = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: register,
		onSuccess: (data) => {
			queryClient.setQueryData(["activationToken"], data.activationToken);
		},
	});
};

const activateUser = async ({
	activation_token,
	activation_code,
}: {
	activation_token: string;
	activation_code: string;
}) => {
	try {
		const response = await api.post("/user/activate-user", {
			activation_token,
			activation_code,
		});
		return response.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to activate user");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error activating user: " + error.message);
		}
	}
};

export const useActivateUser = () => {
	return useMutation({
		mutationFn: activateUser,
	});
};

interface LoginParams {
	email: string;
	password: string;
}

const login = async ({ email, password }: LoginParams) => {
	try {
		const res = await api.post("/user/", { email, password });
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Login failed");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error in login request: " + error.message);
		}
	}
};

export const useLogin = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			queryClient.setQueryData(["user"], data.user);
		},
	});
};


const logout = async () => {
	try {
		const res = await api.get("/user/logout");
		return res.data;
	} catch (error: any) {
		throw new Error("Error in logout request: " + error.message);
	}
};

export const useLogout = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: logout,
		onSuccess: () => {
			queryClient.setQueryData(["user"], null);
		},
	});
};

interface User {
	id: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	email: string;
	age?: number;
	phone: string;
	role: string;
	gender: string;
	avatar?: string;
	address?: string;
	bio?: string;
	studentId?: string;
	instructorId?: string;
	isActive: boolean;
	emailVerified: boolean;
	allowLoginWithoutRequirements?: boolean;
	lastLoginAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const getCurrentUser = async () => {
	try {
		const res = await api.get("/user/me");
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to get user");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error getting user: " + error.message);
		}
	}
};

export const useAuth = () => {
	const {
		data: user,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["user"],
		queryFn: getCurrentUser,
		retry: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return {
		user,
		isLoading,
		error,
		refetch,
		isAuthenticated: !!user,
	};
};

// Forgot Password
interface ForgotPasswordParams {
	email: string;
}

const forgotPassword = async ({ email }: ForgotPasswordParams) => {
	try {
		const res = await api.post("/user/forgot-password", { email });
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to send verification code");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error requesting password reset: " + error.message);
		}
	}
};

export const useForgotPassword = () => {
	return useMutation({
		mutationFn: forgotPassword,
	});
};

// Reset Password
interface ResetPasswordParams {
	email: string;
	activation_code: string;
	password: string;
}

const resetPassword = async ({ email, activation_code, password }: ResetPasswordParams) => {
	try {
		const res = await api.post("/user/reset-password", { email, activation_code, password });
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to reset password");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error resetting password: " + error.message);
		}
	}
};

export const useResetPassword = () => {
	return useMutation({
		mutationFn: resetPassword,
	});
};

// Edit User
interface EditUserParams {
	id: string;
	firstName?: string;
	lastName?: string;
	middleName?: string;
	email?: string;
	phone?: string;
	age?: number;
	gender?: string;
	address?: string;
	bio?: string;
	studentId?: string;
	instructorId?: string;
	role?: string;
	password?: string;
	avatar?: File;
	departmentId?: string;
	program?: string;
	specialization?: string;
	yearLevel?: string;
}

const editUser = async (userData: EditUserParams) => {
	const formData = new FormData();

	// Add all provided fields to FormData
	if (userData.firstName) {
		formData.append("firstName", userData.firstName);
	}
	if (userData.lastName) {
		formData.append("lastName", userData.lastName);
	}
	if (userData.middleName !== undefined) {
		formData.append("middleName", userData.middleName);
	}
	if (userData.email) {
		formData.append("email", userData.email);
	}
	if (userData.phone) {
		formData.append("phone", userData.phone);
	}
	if (userData.age !== undefined) {
		formData.append("age", userData.age.toString());
	}
	if (userData.gender) {
		formData.append("gender", userData.gender);
	}
	if (userData.address !== undefined) {
		formData.append("address", userData.address);
	}
	if (userData.bio !== undefined) {
		formData.append("bio", userData.bio);
	}
	if (userData.studentId !== undefined) {
		formData.append("studentId", userData.studentId);
	}
	if (userData.instructorId !== undefined) {
		formData.append("instructorId", userData.instructorId);
	}
	if (userData.role) {
		formData.append("role", userData.role);
	}
	if (userData.departmentId !== undefined) {
		formData.append("departmentId", userData.departmentId);
	}
	if (userData.program !== undefined) {
		formData.append("program", userData.program);
	}
	if (userData.specialization !== undefined) {
		formData.append("specialization", userData.specialization);
	}
	if (userData.yearLevel !== undefined) {
		formData.append("yearLevel", userData.yearLevel);
	}
	if (userData.password) {
		formData.append("password", userData.password);
	}
	if (userData.avatar) {
		formData.append("avatar", userData.avatar);
	}

	try {
		const res = await api.put(`/user/${userData.id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to update user");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error updating user: " + error.message);
		}
	}
};

export const useEditUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: editUser,
		onSuccess: (data) => {
			// Update the user data in the cache
			queryClient.setQueryData(["user"], data.user);
			// Invalidate and refetch user data to ensure consistency
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
	});
};

// Change Password
interface ChangePasswordParams {
	currentPassword: string;
	newPassword: string;
}

const changePassword = async ({ currentPassword, newPassword }: ChangePasswordParams) => {
	try {
		const res = await api.put("/user/change-password", { currentPassword, newPassword });
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to change password");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error changing password: " + error.message);
		}
	}
};

export const useChangePassword = () => {
	return useMutation({
		mutationFn: changePassword,
	});
};


// Update allow login without requirements setting
interface UpdateAllowLoginWithoutRequirementsParams {
	allowLoginWithoutRequirements: boolean;
}

const updateAllowLoginWithoutRequirements = async ({
	allowLoginWithoutRequirements,
}: UpdateAllowLoginWithoutRequirementsParams) => {
	try {
		const res = await api.put("/user/allow-login-without-requirements", {
			allowLoginWithoutRequirements,
		});
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(
				error.response.data.message || "Failed to update setting"
			);
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error updating setting: " + error.message);
		}
	}
};

export const useUpdateAllowLoginWithoutRequirements = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateAllowLoginWithoutRequirements,
		onSuccess: () => {
			// Invalidate and refetch user data to ensure consistency
			queryClient.invalidateQueries({ queryKey: ["user"] });
			// Invalidate all student queries since instructor setting affects student data
			// This ensures students see updated instructor settings immediately
			queryClient.invalidateQueries({ queryKey: ["student"] });
			queryClient.invalidateQueries({ queryKey: ["students"] });
			queryClient.invalidateQueries({ queryKey: ["students-by-teacher"] });
		},
	});
};