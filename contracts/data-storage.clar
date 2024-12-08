;; data-storage contract

(define-data-var next-data-id uint u0)

(define-map cultural-data
  { data-id: uint }
  {
    contributor: (buff 32), ;; Hashed contributor ID for anonymity
    data-type: (string-ascii 20),
    content-hash: (buff 32),
    timestamp: uint
  }
)

(define-public (submit-data (contributor-hash (buff 32)) (data-type (string-ascii 20)) (content-hash (buff 32)))
  (let
    (
      (data-id (var-get next-data-id))
    )
    (map-set cultural-data
      { data-id: data-id }
      {
        contributor: contributor-hash,
        data-type: data-type,
        content-hash: content-hash,
        timestamp: block-height
      }
    )
    (var-set next-data-id (+ data-id u1))
    (ok data-id)
  )
)

(define-read-only (get-data (data-id uint))
  (map-get? cultural-data { data-id: data-id })
)

(define-read-only (get-data-count)
  (var-get next-data-id)
)

