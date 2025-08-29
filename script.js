// 文件上传功能实现
class FileUploader {
    constructor() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.lastStepBtn = document.getElementById('lastStepBtn');
        this.finishBtn = document.getElementById('finishBtn');
        
        this.currentFile = null;
        this.allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        this.imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        
        this.initEventListeners();
        this.initResponsiveFeatures();
    }
    
    initEventListeners() {
        // 点击上传区域
        this.uploadZone.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // 文件选择
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });
        
        // 拖拽功能
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('dragover');
        });
        
        this.uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('dragover');
        });
        
        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
        
        // 按钮事件
        this.lastStepBtn.addEventListener('click', () => {
            this.handleLastStep();
        });
        
        this.finishBtn.addEventListener('click', () => {
            this.handleFinish();
        });
        
        // 键盘支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target === this.uploadZone) {
                this.fileInput.click();
            }
        });
        
        // 无障碍支持
        this.uploadZone.setAttribute('tabindex', '0');
        this.uploadZone.setAttribute('role', 'button');
        this.uploadZone.setAttribute('aria-label', '点击或拖拽文件到此区域上传简历或图片');
    }
    
    handleFileSelect(file) {
        if (!file) return;
        
        // 文件类型验证
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.allowedTypes.includes(fileExtension)) {
            this.showNotification('请选择支持的文件格式：PDF, DOC, DOCX, TXT, JPG, PNG, GIF, WEBP, BMP, SVG', 'error');
            return;
        }
        
        // 文件大小验证
        if (file.size > this.maxFileSize) {
            this.showNotification('文件大小超过限制（最大10MB）', 'error');
            return;
        }
        
        this.currentFile = file;
        this.displayFileInfo(file);
        this.uploadZone.style.display = 'none';
        this.fileInfo.style.display = 'block';
        
        // 添加上传成功动效
        this.showNotification('文件上传成功！', 'success');
        
        // 启用完成按钮
        this.finishBtn.disabled = false;
        this.finishBtn.style.opacity = '1';
    }
    
    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        
        // 检查是否为图片文件
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        const isImage = this.imageTypes.includes(fileExtension);
        
        if (isImage) {
            this.showImagePreview(file);
        } else {
            this.hideImagePreview();
        }
        
        // 添加文件类型图标动画
        const fileIcon = this.fileInfo.querySelector('svg path');
        if (fileIcon) {
            fileIcon.style.animation = 'pulse 0.5s ease-in-out';
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showImagePreview(file) {
        // 创建或获取图片预览容器
        let previewContainer = this.fileInfo.querySelector('.image-preview');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.className = 'image-preview';
            this.fileInfo.appendChild(previewContainer);
        }
        
        // 清空之前的预览
        previewContainer.innerHTML = '';
        
        // 创建文件读取器
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = '图片预览';
            img.style.cssText = `
                max-width: 100%;
                max-height: 200px;
                border-radius: 8px;
                margin-top: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
                cursor: pointer;
            `;
            
            // 添加悬停效果
            img.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.02)';
            });
            
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
            });
            
            // 添加点击放大功能
            img.addEventListener('click', () => {
                this.showImageModal(e.target.result, file.name);
            });
            
            previewContainer.appendChild(img);
            
            // 添加动画效果
            img.style.opacity = '0';
            img.style.transform = 'translateY(10px)';
            setTimeout(() => {
                img.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                img.style.opacity = '1';
                img.style.transform = 'translateY(0)';
            }, 50);
        };
        
        reader.readAsDataURL(file);
    }
    
    hideImagePreview() {
        const previewContainer = this.fileInfo.querySelector('.image-preview');
        if (previewContainer) {
            previewContainer.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                previewContainer.remove();
            }, 200);
        }
    }
    
    showImageModal(imageSrc, fileName) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            text-align: center;
            position: relative;
        `;
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = fileName;
        img.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            background: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            font-weight: bold;
            color: #333;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        `;
        
        const title = document.createElement('p');
        title.textContent = fileName;
        title.style.cssText = `
            color: white;
            margin-top: 16px;
            font-size: 16px;
            font-weight: 500;
        `;
        
        modalContent.appendChild(img);
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 关闭模态框功能
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // 添加键盘ESC关闭功能
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
        
        // 添加动画样式
        if (!document.querySelector('#modal-style')) {
            const style = document.createElement('style');
            style.id = 'modal-style';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    handleLastStep() {
        // 添加页面切换动画
        document.body.style.animation = 'slideOutRight 0.3s ease-in-out';
        
        setTimeout(() => {
            this.showNotification('返回上一步', 'info');
            // 这里可以添加实际的页面跳转逻辑
        }, 300);
    }
    
    handleFinish() {
        if (!this.currentFile) {
            this.showNotification('请先上传文件', 'warning');
            return;
        }
        
        // 添加完成动画
        this.finishBtn.style.animation = 'pulse 0.3s ease-in-out';
        
        // 模拟文件处理过程
        this.showLoadingState();
        
        setTimeout(() => {
            this.showNotification('简历上传完成！正在解析和优化...', 'success');
            this.completeProcess();
        }, 2000);
    }
    
    showLoadingState() {
        this.finishBtn.innerHTML = '<span class="loading-spinner"></span>处理中...';
        this.finishBtn.disabled = true;
        
        // 添加加载动画样式
        const style = document.createElement('style');
        style.textContent = `
            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    completeProcess() {
        this.finishBtn.innerHTML = '完成';
        this.finishBtn.disabled = false;
        
        // 更新进度指示器
        const steps = document.querySelectorAll('.step');
        const stepLines = document.querySelectorAll('.step-line');
        
        steps.forEach(step => step.classList.add('completed'));
        stepLines.forEach(line => line.classList.add('completed'));
        
        // 添加完成庆祝动效
        this.showCelebration();
    }
    
    showCelebration() {
        // 创建彩纸动效
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 50);
        }
    }
    
    createConfetti() {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: hsl(${Math.random() * 360}, 70%, 60%);
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: confetti-fall 3s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
        
        // 添加彩纸下落动画
        if (!document.querySelector('#confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confetti-fall {
                    to {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showNotification(message, type = 'info') {
        // 移除现有通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        // 添加滑入动画
        if (!document.querySelector('#notification-style')) {
            const style = document.createElement('style');
            style.id = 'notification-style';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    initResponsiveFeatures() {
        // 响应式支持
        const handleResize = () => {
            const container = document.querySelector('.container');
            if (window.innerWidth <= 768) {
                container.style.flexDirection = 'column';
            } else {
                container.style.flexDirection = 'row';
            }
        };
        
        window.addEventListener('resize', handleResize);
        handleResize(); // 初始调用
        
        // 触摸设备支持
        if ('ontouchstart' in window) {
            this.uploadZone.addEventListener('touchstart', (e) => {
                this.uploadZone.style.transform = 'scale(0.98)';
            });
            
            this.uploadZone.addEventListener('touchend', (e) => {
                this.uploadZone.style.transform = 'scale(1)';
            });
        }
    }
}

// 移除文件功能
function removeFile() {
    const uploader = window.fileUploader;
    if (uploader) {
        uploader.currentFile = null;
        
        // 清除图片预览
        const previewContainer = uploader.fileInfo.querySelector('.image-preview');
        if (previewContainer) {
            previewContainer.remove();
        }
        
        uploader.fileInfo.style.display = 'none';
        uploader.uploadZone.style.display = 'block';
        uploader.finishBtn.disabled = true;
        uploader.finishBtn.style.opacity = '0.6';
        uploader.showNotification('文件已移除', 'info');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 创建全局实例
    window.fileUploader = new FileUploader();
    
    // 添加页面加载动画
    document.body.style.opacity = '0';
    document.body.style.animation = 'fadeIn 0.5s ease-out forwards';
    
    // 添加淡入动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            to {
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 预加载图标和动画
    const preloadImages = [
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0xNCAySDE2QzQuOSAyIDQgMi45IDQgNFYyMEM0IDIxLjEgNC44OSAyMiA1Ljk5IDIySDEOEMxOS4xIDIyIDIwIDIxLjEgMjAgMjBWOEwxNCAyWiIgZmlsbD0iIzQyODVmNCIvPg0KPHBhdGggZD0iTTE0IDJWOEgyMCIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xMiAxMUw4IDE1SDEwVjE5SDE0VjE1SDE2TDEyIDExWiIgZmlsbD0id2hpdGUiLz4NCjwvc3ZnPg=='
    ];
    
    preloadImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    console.log('文件上传系统初始化完成');
});