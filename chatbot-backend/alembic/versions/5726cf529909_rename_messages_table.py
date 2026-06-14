"""rename Messages table

Revision ID: 5726cf529909
Revises: 6af5b4a5da5b
Create Date: 2026-06-14 14:13:59.995807

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "5726cf529909"
down_revision: Union[str, Sequence[str], None] = "6af5b4a5da5b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.rename_table("Messages", "messages")


def downgrade():
    op.rename_table("messages", "Messages")
