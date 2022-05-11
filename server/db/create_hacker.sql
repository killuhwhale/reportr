-- encoded secret, from server/utils/crypt.js
INSERT INTO companies (title, company_secret) values ('hackerCO', '6a8b36327122ca2ee0a4fe1082819938');
-- password  '40797bf372264ffeb8b3d74fee1b69f3' hashed w/ salt in specific.js
INSERT INTO accounts (username, email, password, account_type, company_id) values ('notrace', 'notrace@hacker.com', '$2b$10$8CmbjaNFzFe7vKFdevIJdeNES9CFQDfS4HBKRzKIi5XS4qFFIh8RC',5, 1);





