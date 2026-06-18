"""add failed document status

Revision ID: d0dfa26778ba
Revises: 3db71e0ffa12
Create Date: 2026-06-18 14:01:27.268766

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "d0dfa26778ba"
down_revision: Union[str, Sequence[str], None] = "3db71e0ffa12"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("ALTER TYPE documentstatus ADD VALUE IF NOT EXISTS 'FAILED';")


def downgrade() -> None:
    """Downgrade schema."""
    pass
