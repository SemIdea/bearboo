type IUserAgentClassification = {
	browser: string;
	os: string;
};

type IUserAgentClassifierHelperAdapter = {
	classify: (userAgent: string) => IUserAgentClassification;
};

export type { IUserAgentClassification, IUserAgentClassifierHelperAdapter };
