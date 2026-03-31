from alembic import op
import sqlalchemy as sa

revision = "0001_user_bookings"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column["name"] for column in inspector.get_columns("users")}

    if "name" not in user_columns:
        op.add_column("users", sa.Column("name", sa.String(length=120), nullable=True))
    if "email" not in user_columns:
        op.add_column("users", sa.Column("email", sa.String(length=255), nullable=True))
    if "phone" not in user_columns:
        op.add_column("users", sa.Column("phone", sa.String(length=32), nullable=True))
    if "address" not in user_columns:
        op.add_column("users", sa.Column("address", sa.String(length=255), nullable=True))
    if "created_at" not in user_columns:
        op.add_column("users", sa.Column("created_at", sa.DateTime(), nullable=True))

    op.execute("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL")

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "created_at" in user_columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.alter_column("created_at", nullable=False)

    existing_indexes = {index["name"] for index in inspector.get_indexes("users")}
    if "ix_users_email" not in existing_indexes:
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    if not inspector.has_table("bookings"):
        op.create_table(
            "bookings",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("helper_id", sa.Integer(), nullable=False),
            sa.Column("date", sa.Date(), nullable=False),
            sa.Column("start_time", sa.Time(), nullable=False),
            sa.Column("end_time", sa.Time(), nullable=False),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
            sa.Column("total_price", sa.Float(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["helper_id"], ["helpers.id"], ondelete="CASCADE"),
        )

    booking_indexes = {index["name"] for index in inspector.get_indexes("bookings")} if inspector.has_table("bookings") else set()
    if "ix_bookings_user_id" not in booking_indexes:
        op.create_index("ix_bookings_user_id", "bookings", ["user_id"], unique=False)
    if "ix_bookings_helper_id" not in booking_indexes:
        op.create_index("ix_bookings_helper_id", "bookings", ["helper_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_bookings_helper_id", table_name="bookings")
    op.drop_index("ix_bookings_user_id", table_name="bookings")
    op.drop_table("bookings")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_column("users", "created_at")
    op.drop_column("users", "address")
    op.drop_column("users", "phone")
    op.drop_column("users", "email")
    op.drop_column("users", "name")
