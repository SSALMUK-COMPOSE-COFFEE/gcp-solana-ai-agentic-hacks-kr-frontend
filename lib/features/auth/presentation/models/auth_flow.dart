/// 인증번호·비밀번호 화면이 어느 흐름에서 열렸는지 나타낸다.
///
/// 두 흐름이 같은 화면을 공유하지만 제목·버튼 문구와 다음 목적지가 다르다.
/// 라우트 쿼리로 실어 보내므로 웹에서 새로고침해도 흐름이 유지된다.
enum AuthFlow {
  /// 회원가입: 정보 입력 → 인증번호 → 비밀번호 설정
  signup('signup'),

  /// 비밀번호 찾기: 이메일 → 인증번호 → 비밀번호 재설정
  passwordReset('reset');

  const AuthFlow(this.queryValue);

  final String queryValue;

  /// 알 수 없는 값이면 회원가입으로 본다. 주소를 직접 고쳐 들어온 경우에도
  /// 화면이 깨지지 않게 하기 위함이다.
  static AuthFlow fromQuery(String? value) {
    return AuthFlow.values.firstWhere(
      (flow) => flow.queryValue == value,
      orElse: () => AuthFlow.signup,
    );
  }
}
