"""add status column to t_user

Revision ID: 4a3252b10703
Revises: df28ff728fab
Create Date: 2025-09-09 16:52:56.626948
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '4a3252b10703'
down_revision: Union[str, Sequence[str], None] = 'df28ff728fab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add status column with default False for existing rows
    op.add_column(
        't_user',
        sa.Column('status', sa.Boolean(), nullable=False, server_default=sa.false())
    )
    # Optional: remove server_default so future inserts rely on Python default
    op.alter_column('t_user', 'status', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    # Remove the status column
    op.drop_column('t_user', 'status')
