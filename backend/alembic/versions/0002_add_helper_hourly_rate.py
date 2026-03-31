from alembic import op
import sqlalchemy as sa

revision = "0002_add_helper_hourly_rate"
down_revision = "0001_user_bookings"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("helpers", sa.Column("hourly_rate", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("helpers", "hourly_rate")
