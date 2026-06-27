"""Update quiz_attempts table

Revision ID: a1b2c3d4e5f6
Revises: ff5bc31c62e5
Create Date: 2026-06-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'ff5bc31c62e5'
branch_labels = None
depends_on = None


def upgrade():
    # Use raw SQL for Postgres to avoid foreign key naming constraint issues
    op.execute("ALTER TABLE quiz_attempts DROP COLUMN IF EXISTS quiz_id CASCADE;")
    op.execute("ALTER TABLE quiz_attempts DROP COLUMN IF EXISTS total_questions;")
    op.execute("ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE;")
    op.execute("ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS percentage FLOAT DEFAULT 0 NOT NULL;")
    op.execute("ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0 NOT NULL;")
    op.execute("ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS wrong_answers INTEGER DEFAULT 0 NOT NULL;")
    
    # In case there are null lesson_ids from existing data, delete those rows or set to a default
    op.execute("DELETE FROM quiz_attempts WHERE lesson_id IS NULL;")
    # Set it to NOT NULL
    op.execute("ALTER TABLE quiz_attempts ALTER COLUMN lesson_id SET NOT NULL;")


def downgrade():
    op.execute("ALTER TABLE quiz_attempts DROP COLUMN IF EXISTS lesson_id CASCADE;")
    op.execute("ALTER TABLE quiz_attempts DROP COLUMN IF EXISTS percentage;")
    op.execute("ALTER TABLE quiz_attempts DROP COLUMN IF EXISTS correct_answers;")
    op.execute("ALTER TABLE quiz_attempts DROP COLUMN IF EXISTS wrong_answers;")
    op.execute("ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE;")
    op.execute("ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0 NOT NULL;")
