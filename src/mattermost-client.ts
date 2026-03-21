/**
 * Mattermost API Client
 * Based on Mattermost REST API v4
 */

interface MattermostConfig {
	baseUrl: string;
	token: string;
	teamId: string;
}

export interface Channel {
	id: string;
	create_at: number;
	update_at: number;
	delete_at: number;
	team_id: string;
	type: string;
	display_name: string;
	name: string;
	header: string;
	purpose: string;
	last_post_at: number;
	total_msg_count: number;
	extra_update_at: number;
	creator_id: string;
}

export interface Post {
	id: string;
	create_at: number;
	update_at: number;
	edit_at: number;
	delete_at: number;
	is_pinned: boolean;
	user_id: string;
	channel_id: string;
	root_id: string;
	parent_id: string;
	original_id: string;
	message: string;
	type: string;
	props: Record<string, unknown>;
	hashtags: string;
	pending_post_id: string;
	reply_count: number;
	last_reply_at: number;
	participants: string[] | null;
	metadata: Record<string, unknown> | null;
}

export interface User {
	id: string;
	create_at: number;
	update_at: number;
	delete_at: number;
	username: string;
	auth_service: string;
	email: string;
	nickname: string;
	first_name: string;
	last_name: string;
	position: string;
	roles: string;
	locale: string;
}

export interface Reaction {
	user_id: string;
	post_id: string;
	emoji_name: string;
	create_at: number;
}

export interface PostsResponse {
	posts: Record<string, Post>;
	order: string[];
	next_post_id?: string;
	prev_post_id?: string;
	has_next?: boolean;
	has_prev?: boolean;
}

export interface ChannelsResponse {
	channels: Channel[];
	total_count: number;
}

export interface UsersResponse {
	users: User[];
	total_count: number;
}

export class MattermostClient {
	private baseUrl: string;
	private headers: Record<string, string>;
	private teamId: string;
	private requestId: string;

	constructor(baseUrl: string, token: string, teamId: string, requestId: string) {
		this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
		this.teamId = teamId;
		this.requestId = requestId;
		this.headers = {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
			'X-Request-ID': requestId,
		};
	}

	private async fetch(url: string, options?: RequestInit): Promise<Response> {
		const response = await fetch(url, {
			...options,
			headers: {
				...this.headers,
				...options?.headers,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Mattermost API error: ${response.status} ${response.statusText} - ${errorText}`);
		}

		return response;
	}

	// Channel-related methods
	async getChannels(limit: number = 100, page: number = 0): Promise<ChannelsResponse> {
		const url = new URL(`${this.baseUrl}/api/v4/teams/${this.teamId}/channels`);
		url.searchParams.append('page', page.toString());
		url.searchParams.append('per_page', limit.toString());

		const response = await this.fetch(url.toString());
		const channelsArray = await response.json() as Channel[];

		return {
			channels: channelsArray,
			total_count: channelsArray.length,
		};
	}

	async getChannel(channelId: string): Promise<Channel> {
		const url = `${this.baseUrl}/api/v4/channels/${channelId}`;
		const response = await this.fetch(url);
		return response.json() as Promise<Channel>;
	}

	// Post-related methods
	async createPost(channelId: string, message: string, rootId?: string): Promise<Post> {
		const url = `${this.baseUrl}/api/v4/posts`;
		const body = {
			channel_id: channelId,
			message,
			root_id: rootId || '',
		};

		const response = await this.fetch(url, {
			method: 'POST',
			body: JSON.stringify(body),
		});

		return response.json() as Promise<Post>;
	}

	async getPostsForChannel(channelId: string, limit: number = 30, page: number = 0): Promise<PostsResponse> {
		const url = new URL(`${this.baseUrl}/api/v4/channels/${channelId}/posts`);
		url.searchParams.append('page', page.toString());
		url.searchParams.append('per_page', limit.toString());

		const response = await this.fetch(url.toString());
		return response.json() as Promise<PostsResponse>;
	}

	async getPost(postId: string): Promise<Post> {
		const url = `${this.baseUrl}/api/v4/posts/${postId}`;
		const response = await this.fetch(url);
		return response.json() as Promise<Post>;
	}

	async getPostThread(postId: string): Promise<PostsResponse> {
		const url = `${this.baseUrl}/api/v4/posts/${postId}/thread`;
		const response = await this.fetch(url);
		return response.json() as Promise<PostsResponse>;
	}

	// Reaction-related methods
	async addReaction(postId: string, emojiName: string): Promise<Reaction> {
		const url = `${this.baseUrl}/api/v4/reactions`;
		const body = {
			post_id: postId,
			emoji_name: emojiName,
			create_at: 0,
			user_id: '',
		};

		const response = await this.fetch(url, {
			method: 'POST',
			body: JSON.stringify(body),
		});

		return response.json() as Promise<Reaction>;
	}

	// User-related methods
	async getUsers(limit: number = 100, page: number = 0): Promise<UsersResponse> {
		const url = new URL(`${this.baseUrl}/api/v4/users`);
		url.searchParams.append('page', page.toString());
		url.searchParams.append('per_page', limit.toString());

		const response = await this.fetch(url.toString());
		const usersArray = await response.json() as User[];

		return {
			users: usersArray,
			total_count: usersArray.length,
		};
	}

	async getUser(userId: string): Promise<User> {
		const url = `${this.baseUrl}/api/v4/users/${userId}`;
		const response = await this.fetch(url);
		return response.json() as Promise<User>;
	}

	async getUserByUsername(username: string): Promise<User> {
		const url = `${this.baseUrl}/api/v4/users/username/${username}`;
		const response = await this.fetch(url);
		return response.json() as Promise<User>;
	}

	// Direct message channel methods
	async createDirectMessageChannel(userId: string): Promise<Channel> {
		const url = `${this.baseUrl}/api/v4/channels/direct`;
		const body = [userId];

		const response = await this.fetch(url, {
			method: 'POST',
			body: JSON.stringify(body),
		});

		return response.json() as Promise<Channel>;
	}
}
