/// Endpoint paths, mirroring `docs/api-spec.md`.
///
/// Keeping them here rather than inline at call sites means a backend path
/// change is a one-line edit, and typos surface at compile time.
library;

abstract final class ApiPaths {
  static const String health = '/health';
}

abstract final class AuthPaths {
  static const String signup = '/auth/signup';
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String refresh = '/auth/refresh';
  static const String walletNonce = '/auth/wallet/nonce';
  static const String walletConnect = '/auth/wallet/connect';
  static const String passkeyRegister = '/auth/passkey/register';
  static const String passkeyLogin = '/auth/passkey/login';
}

abstract final class UserPaths {
  static const String me = '/users/me';
  static const String meTiny = '/users/me/tiny';
  static const String meContributions = '/users/me/contributions';
  static const String meCertificates = '/users/me/certificates';
  static const String meWithdraw = '/users/me/withdraw';

  static String byId(String id) => '/users/$id';
}

abstract final class CampaignPaths {
  static const String root = '/campaign';

  static String byId(String id) => '/campaign/$id';

  static String quotes(String id) => '/campaign/$id/quotes';

  static String status(String id) => '/campaign/$id/status';

  static String contributions(String id) => '/campaign/$id/contributions';

  static String close(String id) => '/campaign/$id/close';
}

abstract final class VendorPaths {
  static const String root = '/vendor';

  static String byId(String id) => '/vendor/$id';

  static String quote(String id) => '/vendor/$id/quote';

  static String allowlist(String id) => '/vendor/$id/allowlist';
}

abstract final class PaymentPaths {
  static const String contribute = '/payment/contribute';
  static const String solanaPayQr = '/payment/solana-pay/qr';
  static const String payshMicropay = '/payment/paysh/micropay';
  static const String payshUsage = '/payment/paysh/usage';

  static String solanaPayStatus(String reference) =>
      '/payment/solana-pay/$reference/status';
}

abstract final class ProofPaths {
  static const String quote = '/proof/quote';
  static const String receipt = '/proof/receipt';
  static const String certificateMint = '/proof/certificate/mint';

  static String byId(String id) => '/proof/$id';

  static String verify(String id) => '/proof/$id/verify';

  static String certificate(String id) => '/proof/certificate/$id';
}

abstract final class SettlementPaths {
  static String byCampaign(String campaignId) => '/settlement/$campaignId';

  static String breakdown(String campaignId) =>
      '/settlement/$campaignId/breakdown';

  static String refund(String campaignId) => '/settlement/$campaignId/refund';

  static String release(String campaignId) => '/settlement/$campaignId/release';
}

abstract final class AgentPaths {
  static const String negotiate = '/agent/negotiate';
  static const String policyEvaluate = '/agent/policy/evaluate';
  static const String audit = '/agent/audit';
  static const String a2aMessage = '/agent/a2a/message';
  static const String status = '/agent/status';

  static String decisions(String campaignId) => '/agent/$campaignId/decisions';
}
