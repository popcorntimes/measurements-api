CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Inserindo dados de teste na tabela customer_measures
INSERT INTO customer_measures (customer_code) VALUES 
('CUST001'),
('CUST002'),
('CUST003'),
('CUST004'),
('CUST005');

-- Inserindo dados de teste na tabela measures
INSERT INTO measures (measure_uuid, measure_datetime, measure_type, has_confirmed, image_url, measure_value, customer_code) VALUES 
(gen_random_uuid(), '2024-09-01 10:00:00', 'WATER', true, 'http://example.com/image1.png', '36.5', 'CUST001'),
(gen_random_uuid(), '2024-09-02 11:30:00', 'GAS', false, 'http://example.com/image2.png', '120/80', 'CUST001'),
(gen_random_uuid(), '2024-09-03 14:15:00', 'GAS', true, 'http://example.com/image3.png', '37.2', 'CUST002'),
(gen_random_uuid(), '2024-09-04 09:45:00', 'WATER', false, 'http://example.com/image4.png', '55%', 'CUST003'),
(gen_random_uuid(), '2024-09-05 08:30:00', 'GAS', true, 'http://example.com/image5.png', '36.8', 'CUST004'),
(gen_random_uuid(), '2024-09-06 15:20:00', 'WATER', true, 'http://example.com/image6.png', '118/76', 'CUST005');