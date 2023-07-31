import { request } from "@/utils/request";
import { Comment } from "@/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Gets the comments for an member
export async function requestComments(OrganizationId: string, memberId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/members/${memberId}/comments`, {
      method: "GET",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestDeleteAttachments(OrganizationId: string, memberId: string, commentId: string, attachmentId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/members/${memberId}/comments/${commentId}/attachments/${attachmentId}`, {
      method: "DELETE",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}

export async function requestCreateComment(OrganizationId: string, memberId: string, comment: Comment) {
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

    const data = await request(`${apiUrl}/organizations/${OrganizationId}/members/${memberId}/comments`, {
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

export async function requestUpdateComment(OrganizationId: string, memberId: string, comment: Comment) {
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

    const data = await request(`${apiUrl}/organizations/${OrganizationId}/members/${memberId}/comments/${comment.id}`, {
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

export async function requestDeleteComment(OrganizationId: string, memberId: string, commentId: string) {
  try {
    const data = await request(`${apiUrl}/organizations/${OrganizationId}/members/${memberId}/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include"
    });

    return Promise.resolve(data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}