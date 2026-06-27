"""add missing columns to courses robust

Revision ID: ff5bc31c62e5
Revises: f1b34385f0c6
Create Date: 2026-06-26 19:26:07.686579

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ff5bc31c62e5'
down_revision = 'f1b34385f0c6'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    from sqlalchemy.engine.reflection import Inspector
    inspector = Inspector.from_engine(conn)
    columns = [col['name'] for col in inspector.get_columns('courses')]

    with op.batch_alter_table('courses', schema=None) as batch_op:
        def safe_add_column(col_name, col_type):
            if col_name not in columns:
                batch_op.add_column(sa.Column(col_name, col_type, nullable=True))

        safe_add_column('description', sa.Text())
        safe_add_column('estimated_time', sa.String(length=100))
        safe_add_column('weekly_plan', sa.Text())
        safe_add_column('monthly_milestones', sa.Text())
        safe_add_column('interview_questions', sa.Text())
        safe_add_column('learning_outcomes', sa.Text())
        safe_add_column('prerequisites', sa.Text())


def downgrade():
    pass
