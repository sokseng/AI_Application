"""insert global settings

Revision ID: 03818508b118
Revises: 4a3252b10703
Create Date: 2025-09-09 17:52:08.780529

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '03818508b118'
down_revision: Union[str, Sequence[str], None] = '4a3252b10703'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Insert default global settings if they do not exist."""
    op.execute("""
        INSERT INTO t_global_setting (code, name, value, type)
        VALUES 
            ('PASSWORD_SET_LIST_SPECIAL_CHARACTERS','TS_GS_SET_LIST_SPECIAL_CHARACTERS','','Text'),
            ('MINIMUM_NUMBER_OF_CHARACTERS_IN_PASSWORD','TS_GS_MINIMUM_NUMBER_OF_CHARACTERS_IN_PASSWORD','','Number'),
            ('MAXIMUM_NUMBER_OF_CHARACTERS_IN_PASSWORD','TS_GS_MAXIMUM_NUMBER_OF_CHARACTERS_IN_PASSWORD','','Number'),
            ('AT_LEAST_ONE_NUMBER_REQUIRED_IN_PASSWORD','TS_GS_AT_LEAST_ONE_NUMBER_REQUIRED_IN_PASSWORD','False','Boolean'),
            ('AT_LEAST_ONE_LOWERCASE_CHARACTER_REQUIRED_IN_PASSWORD','TS_GS_AT_LEAST_ONE_LOWERCASE_CHARACTER_REQUIRED_IN_PASSWORD','False','Boolean'),
            ('AT_LEAST_ONE_UPPERCASE_CHARACTER_REQUIRED_IN_PASSWORD','TS_GS_AT_LEAST_ONE_UPPERCASE_CHARACTER_REQUIRED_IN_PASSWORD','False','Boolean')
        ON CONFLICT (code) DO NOTHING;
    """)


def downgrade() -> None:
    """Optional: remove these global settings"""
    op.execute("""
        DELETE FROM t_global_setting
        WHERE code IN (
            'PASSWORD_SET_LIST_SPECIAL_CHARACTERS',
            'MINIMUM_NUMBER_OF_CHARACTERS_IN_PASSWORD',
            'MAXIMUM_NUMBER_OF_CHARACTERS_IN_PASSWORD',
            'AT_LEAST_ONE_NUMBER_REQUIRED_IN_PASSWORD',
            'AT_LEAST_ONE_LOWERCASE_CHARACTER_REQUIRED_IN_PASSWORD',
            'AT_LEAST_ONE_UPPERCASE_CHARACTER_REQUIRED_IN_PASSWORD'
        );
    """)
