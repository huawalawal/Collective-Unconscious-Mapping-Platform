;; governance contract

(define-data-var next-proposal-id uint u0)

(define-map proposals
  { proposal-id: uint }
  {
    title: (string-utf8 100),
    description: (string-utf8 500),
    proposer: principal,
    status: (string-ascii 20),
    votes-for: uint,
    votes-against: uint,
    end-block: uint
  }
)

(define-map votes
  { proposal-id: uint, voter: principal }
  { vote: bool }
)

(define-constant VOTING_PERIOD u1440) ;; Approximately 10 days with 10-minute block times

(define-public (create-proposal (title (string-utf8 100)) (description (string-utf8 500)))
  (let
    (
      (proposal-id (var-get next-proposal-id))
    )
    (map-set proposals
      { proposal-id: proposal-id }
      {
        title: title,
        description: description,
        proposer: tx-sender,
        status: "active",
        votes-for: u0,
        votes-against: u0,
        end-block: (+ block-height VOTING_PERIOD)
      }
    )
    (var-set next-proposal-id (+ proposal-id u1))
    (ok proposal-id)
  )
)

(define-public (vote (proposal-id uint) (vote-for bool))
  (let
    (
      (proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) (err u404)))
    )
    (asserts! (< block-height (get end-block proposal)) (err u400))
    (asserts! (is-none (map-get? votes { proposal-id: proposal-id, voter: tx-sender })) (err u403))
    (map-set votes { proposal-id: proposal-id, voter: tx-sender } { vote: vote-for })
    (if vote-for
      (map-set proposals { proposal-id: proposal-id }
        (merge proposal { votes-for: (+ (get votes-for proposal) u1) }))
      (map-set proposals { proposal-id: proposal-id }
        (merge proposal { votes-against: (+ (get votes-against proposal) u1) }))
    )
    (ok true)
  )
)

(define-public (end-proposal (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) (err u404)))
    )
    (asserts! (>= block-height (get end-block proposal)) (err u400))
    (ok (map-set proposals { proposal-id: proposal-id }
      (merge proposal { status: (if (> (get votes-for proposal) (get votes-against proposal)) "passed" "rejected") })))
  )
)

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals { proposal-id: proposal-id })
)

