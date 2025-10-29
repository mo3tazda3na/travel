const defaultErrorMessage = (status) => `Request failed with status ${status}`;

export const parseBackendResponse = async (response) => {
  if (response.status === 204) {
    return { status: response.status, data: null, payload: null };
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    payload = null;
  }

  const successFlag =
    payload && typeof payload === 'object' && 'success' in payload ? payload.success : undefined;

  const data =
    payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;

  if (!response.ok || successFlag === false) {
    const message =
      (payload && (payload.message || payload.error)) || defaultErrorMessage(response.status);

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    error.logId = payload?.logId;
    throw error;
  }

  return {
    status: response.status,
    data,
    payload,
    meta: payload && typeof payload === 'object' ? payload.meta : undefined
  };
};

export const extractDataOrThrow = async (response) => {
  const { data } = await parseBackendResponse(response);
  return data;
};
