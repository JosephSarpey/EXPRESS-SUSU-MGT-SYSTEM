-- CreateIndex
CREATE INDEX "AccountApproval_userId_idx" ON "AccountApproval"("userId");

-- CreateIndex
CREATE INDEX "AccountApproval_approvedById_idx" ON "AccountApproval"("approvedById");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "OTPVerification_userId_idx" ON "OTPVerification"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "Transaction_workerId_idx" ON "Transaction"("workerId");

-- CreateIndex
CREATE INDEX "WorkerSession_workerId_idx" ON "WorkerSession"("workerId");

-- CreateIndex
CREATE INDEX "WorkerSession_status_idx" ON "WorkerSession"("status");
