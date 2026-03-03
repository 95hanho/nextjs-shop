/**
 * 토큰 갱신 중복 방지를 위한 인메모리 Lock
 */
class TokenRefreshLock {
	private locks = new Map<string, Promise<unknown>>();

	async acquireOrWait<T>(key: string, task: () => Promise<T>): Promise<T> {
		// 이미 진행 중인 갱신 작업이 있으면 그 결과를 기다림
		const existing = this.locks.get(key);
		if (existing) {
			console.log(`[TokenLock] 이미 토큰 갱신 중... 대기: ${key}`);
			return existing as Promise<T>;
		}

		// 새로운 갱신 작업 시작
		const promise = task().finally(() => {
			// 작업 완료 후 lock 해제
			this.locks.delete(key);
		});

		this.locks.set(key, promise);
		return promise;
	}

	clear(key: string) {
		this.locks.delete(key);
	}
}

export const tokenRefreshLock = new TokenRefreshLock();
