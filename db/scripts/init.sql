CREATE TABLE IF NOT EXISTS customer_measures (
    customer_code VARCHAR PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS measures (
    measure_uuid UUID PRIMARY KEY,
    measure_datetime TIMESTAMP NOT NULL,
    measure_type VARCHAR(10) NOT NULL,
    has_confirmed BOOLEAN DEFAULT FALSE,
    image_url VARCHAR,
    measure_value TEXT,
    customer_code VARCHAR REFERENCES customer_measures(customer_code)
);
