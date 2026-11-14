-- Reservations table for Zenvora hotel bookings.
-- Native SQL, no ORM.

CREATE TABLE IF NOT EXISTS reservations (
    id                SERIAL PRIMARY KEY,
    booking_reference VARCHAR(64) UNIQUE NOT NULL,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id          INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    check_in          DATE NOT NULL,
    check_out         DATE NOT NULL,
    guests            VARCHAR(50) NOT NULL DEFAULT '2 Guests',
    room_type         VARCHAR(100) NOT NULL DEFAULT 'Deluxe Room',
    guest_name        VARCHAR(150) NOT NULL,
    guest_email       VARCHAR(255) NOT NULL,
    total_amount      NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status            VARCHAR(30) NOT NULL DEFAULT 'Pending'
                      CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
    special_requests  TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reservations_user_id_idx ON reservations (user_id);
CREATE INDEX IF NOT EXISTS reservations_hotel_id_idx ON reservations (hotel_id);
CREATE INDEX IF NOT EXISTS reservations_ref_idx ON reservations (booking_reference);
CREATE INDEX IF NOT EXISTS reservations_status_idx ON reservations (status);

