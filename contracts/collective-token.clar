;; collective-token contract

(define-fungible-token collective-token)

(define-data-var token-uri (string-utf8 256) u"https://example.com/collective-token-metadata")

(define-public (mint (amount uint) (recipient principal))
  (ft-mint? collective-token amount recipient)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (ft-transfer? collective-token amount sender recipient)
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance collective-token account))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply collective-token))
)

(define-public (reward-contribution (contributor principal) (amount uint))
  (ft-mint? collective-token amount contributor)
)

