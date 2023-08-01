import { request } from "@/utils/request";
import { Comment } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Gets the comments for an expense
export async function requestComments(OrganizationId: string, expenseId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${expenseId}/comments`, {
      method: "GET",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestDeleteAttachments(OrganizationId: string, expenseId: string, commentId: string, attachmentId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${expenseId}/comments/${commentId}/attachments/${attachmentId}`, {
      method: "DELETE",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestCreateComment(OrganizationId: string, expenseId: string, comment: Comment) {
  try {
    const formData = new FormData();
    for (const key in comment) {
      formData.append(key, comment[key]);
    }

    // Get rid of preexisting attachments
    const attachments = comment?.Attachments.filter((attachment) => !attachment.id);
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        formData.append("Attachments", attachment);
      }
    }

    const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${expenseId}/comments`, {
      method: "POST",
      credentials: "include",
      body: formData
    }, false);

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestUpdateComment(OrganizationId: string, expenseId: string, comment: Comment) {
  try {
    const formData = new FormData();
    for (const key in comment) {
      formData.append(key, comment[key]);
    }

    // Get rid of preexisting attachments
    const attachments = comment?.Attachments.filter((attachment) => !attachment.id);
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        formData.append("Attachments", attachment);
      }
    }

    const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${expenseId}/comments/${comment.id}`, {
      method: "PUT",
      credentials: "include",
      body: formData
    }, false);

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestDeleteComment(OrganizationId: string, expenseId: string, commentId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/expenses/${expenseId}/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}