import {BaseResource} from '../../shared/infrastructure/base-response';

/**
 * Resource interface for sign-in response.
 */
export interface SignInResource extends BaseResource {
  id: number;
  username: string;
  roles: string[];
  token: string;
  mfaRequired: boolean;
}

/**
 * Response interface for sign-in API.
 */
export interface SignInResponse extends BaseResource, SignInResource {}
