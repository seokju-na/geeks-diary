export interface VcsRemoteRepository {
    readonly url: string;
    readonly apiUrl?: string;
    readonly name: string;
    readonly gitUrl?: string;
    readonly sshUrl?: string;
}
