// FR-06, FR-08, FR-09: Journal entry API calls

import { apiService as api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import type {
	CreateEntryPayload,
	Entry,
	EntryListItem,
	EntryPagination,
	GetEntriesParams,
	UpdateEntryPayload,
} from "@/types/entry.types";

export const entryService = {
	// FR-06: Create new entry
	create: (payload: CreateEntryPayload) =>
		api.post<ApiResponse<{ entry: Entry }>>("/entries", payload),

	// FR-06: Get paginated list (returns preview, not full content)
	getList: (params?: GetEntriesParams) =>
		api.get<ApiResponse<{ entries: EntryListItem[]; pagination: EntryPagination }>>("/entries", {
			params,
		}),

	// FR-06: Get single entry with full Delta content
	getById: (id: string) => api.get<ApiResponse<{ entry: Entry }>>(`/entries/${id}`),

	// FR-09: Update entry (partial — title, content, tags, isPrivate)
	update: (id: string, payload: UpdateEntryPayload) =>
		api.patch<ApiResponse<{ entry: Entry }>>(`/entries/${id}`, payload),

	// FR-09: Delete single entry permanently
	delete: (id: string) => api.delete<ApiResponse<null>>(`/entries/${id}`),

	// FR-09: Bulk delete (IDs not found or owned by others are silently skipped)
	bulkDelete: (ids: string[]) =>
		api.post<ApiResponse<{ deletedCount: number }>>("/entries/bulk-delete", { ids }),
};
