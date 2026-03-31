from alembic import op
import sqlalchemy as sa

revision = "0003_add_reviews"
down_revision = "0002_add_helper_hourly_rate"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("reviews"):
        op.create_table(
            "reviews",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("booking_id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("helper_id", sa.Integer(), nullable=False),
            sa.Column("rating", sa.Integer(), nullable=True),
            sa.Column("comment", sa.String(length=1000), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["helper_id"], ["helpers.id"], ondelete="CASCADE"),
            sa.UniqueConstraint("booking_id", name="uq_reviews_booking"),
        )

    existing_indexes = {index["name"] for index in inspector.get_indexes("reviews")} if inspector.has_table("reviews") else set()
    if "ix_reviews_booking_id" not in existing_indexes:
        op.create_index("ix_reviews_booking_id", "reviews", ["booking_id"], unique=False)
    if "ix_reviews_helper_id" not in existing_indexes:
        op.create_index("ix_reviews_helper_id", "reviews", ["helper_id"], unique=False)
    if "ix_reviews_user_id" not in existing_indexes:
        op.create_index("ix_reviews_user_id", "reviews", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_reviews_user_id", table_name="reviews")
    op.drop_index("ix_reviews_helper_id", table_name="reviews")
    op.drop_index("ix_reviews_booking_id", table_name="reviews")
    op.drop_table("reviews")
