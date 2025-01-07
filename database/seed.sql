INSERT INTO users VALUES
    ('user1', '1234'),
    ('user2', '1234');

INSERT INTO contact_info VALUES
    ('user1', 'First Last', 'Location', 'email@email.com', '123-456-7890', 'https://www.linkedin.com/in/example/', NULL),
    ('user2', 'A B', 'Location', 'email@email.com', '123-456-7890', 'https://www.linkedin.com/in/example/', 'https://github.com/example');

-- ==================================================

INSERT INTO documents (id, document_name, owner, is_master, is_template) VALUES
    (1, 'Master', 'user1', TRUE, FALSE);

INSERT INTO sections VALUES
    (1, 'Education'),
    (2, 'Work Experience'),
    (3, 'Skills'),
    (4, 'Certifications'),
    (5, 'Projects');

-- ==================================================

INSERT INTO text_snippets (id, owner, type, content) VALUES
    (101, 'user1', 'plain', 'abc');

INSERT INTO text_snippets (id, version, owner, type, content) VALUES
    (102, '2025-01-01 12:00:00-08', 'user1', 'plain', 'Languages: JavaScript, HTML, CSS\nTools: Node, Express, Bootstrap');

INSERT INTO text_snippets (id, version, owner, parent, type, content) VALUES
    (103, '2025-01-02 12:00:00-08', 'user1', NULL, 'plain', 'achievement 1'),
    (103, '2025-01-03 12:00:00-08', 'user1', '2025-01-02 12:00:00-08', 'plain', 'achieve 1');

INSERT INTO educations (id, owner, school, location, start_date, end_date, degree, gpa) VALUES
    (1, 'user1', 'University', 'Loc, USA', '2000-01-01', '2004-01-01', 'Degree', '4.0 / 4.0');

INSERT INTO experiences VALUES
    (1, 'user1', 'Job 3', 'Company 3', 'Company Location 3', '2025-01-01', NULL),
    (2, 'user1', 'Job 2', 'Company 2', 'Company Location 2', '2020-01-01', '2024-12-30');

INSERT INTO skills VALUES
    (1, 'software engineering', 'user1', 102, '2025-01-01 12:00:00-08');

-- ==================================================

INSERT INTO documents_x_sections VALUES
    (1, 1, 1),
    (1, 2, 2),
    (1, 3, 0);

INSERT INTO documents_x_educations VALUES
    (1, 1, 0);

INSERT INTO documents_x_experiences VALUES
    (101, 1, 1, 0),
    (102, 1, 2, 1);

INSERT INTO documents_x_skills VALUES
    (1, 1);

INSERT INTO experiences_x_text_snippets VALUES
    (101, 103, '2025-01-02 12:00:00-08', 0);
