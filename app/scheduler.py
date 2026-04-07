import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import update
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models.staff import Staff

# Configure logging
logger = logging.getLogger(__name__)


def increment_leave_balance():
    """
    Cron task to increment leave_balance for all staff members by 1.
    Runs on the 1st of every month at 12:30 AM.
    """
    logger.info("Starting monthly leave balance increment task...")
    db: Session = SessionLocal()
    try:
        # Increment leave_balance by 1 for all staff
        result = db.execute(update(Staff).values(leave_balance=Staff.leave_balance + 1))
        db.commit()
        affected_rows = result.rowcount
        logger.info(
            f"Successfully incremented leave balance for {affected_rows} staff members."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error during leave balance increment: {str(e)}")
    finally:
        db.close()


# Initialize scheduler
scheduler = AsyncIOScheduler()


def start_scheduler():
    """
    Start the scheduler and add the monthly job.
    """
    # 12:30 AM on the 1st day of every month
    # cron: 30 0 1 * *
    scheduler.add_job(
        increment_leave_balance,
        CronTrigger(day=1, hour=0, minute=30),
        id="monthly_leave_increment",
        replace_existing=True,
    )

    # For testing purposes, you could add a 1-minute interval job here:
    # scheduler.add_job(increment_leave_balance, 'interval', minutes=1)

    scheduler.start()
    logger.info(
        "Scheduler started. Monthly leave increment job scheduled for 12:30 AM on the 1st of every month."
    )


def shutdown_scheduler():
    """
    Shutdown the scheduler.
    """
    scheduler.shutdown()
    logger.info("Scheduler shut down.")
